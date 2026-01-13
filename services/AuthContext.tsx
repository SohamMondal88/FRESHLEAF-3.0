
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from './firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setupRecaptcha: (elementId: string) => void;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateWallet: (amount: number) => Promise<void>;
  joinMembership: () => Promise<void>;
  login: (email: string, password?: string, role?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, role?: string, farmName?: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Start loading as true, but check cache immediately
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { addToast } = useToast();

  // 1. Initial Load from Local Storage (Instant Persistence)
  useEffect(() => {
    const cachedUser = localStorage.getItem('freshleaf_user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setLoading(false); // Immediate UI render
      } catch (e) {
        console.error("Failed to parse cached user", e);
      }
    }
  }, []);

  // 2. Sync with Firebase (Background Validation)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch latest profile from Firestore in background
        try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            let userDoc;
            
            try {
                userDoc = await getDoc(userDocRef);
            } catch (networkErr) {
                console.warn("Offline: Could not fetch latest profile, using cache/fallback.");
            }
            
            let currentUserData: User | null = null;

            if (userDoc && userDoc.exists()) {
              currentUserData = { id: fbUser.uid, ...userDoc.data() } as User;
            } else {
              // Fallback 1: Check Local Storage
              const cachedUser = localStorage.getItem('freshleaf_user');
              if (cachedUser) {
                  const parsed = JSON.parse(cachedUser);
                  if (parsed.id === fbUser.uid) {
                      currentUserData = parsed;
                  }
              }

              // Fallback 2: Create default profile from Auth Data if missing
              if (!currentUserData) {
                  currentUserData = {
                    id: fbUser.uid,
                    name: fbUser.displayName || 'FreshLeaf User',
                    email: fbUser.email || '',
                    phone: fbUser.phoneNumber || '',
                    role: 'customer',
                    walletBalance: 0,
                    avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
                    isPro: false,
                    address: ''
                  };
                  // Try to save to DB (Fire & Forget)
                  setDoc(userDocRef, JSON.parse(JSON.stringify(currentUserData))).catch(e => console.warn("Auto-create profile failed (offline)", e));
              }
            }

            // Update State & Cache
            // Only update state if data changed to prevent re-renders
            if (currentUserData) {
                setUser(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(currentUserData)) {
                        localStorage.setItem('freshleaf_user', JSON.stringify(currentUserData));
                        return currentUserData;
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Profile sync error:", error);
            // Even if sync fails completely, we rely on the state set by initial localStorage load or fbUser presence
        }
      } else {
        // User logged out
        setUser(null);
        localStorage.removeItem('freshleaf_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (elementId: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) return;

        if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
            (window as any).recaptchaVerifier = null;
        }

        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': () => console.log("Recaptcha verified"),
            'expired-callback': () => console.log("Recaptcha expired")
        });
    } catch (error) {
        console.error("Error setting up Recaptcha:", error);
    }
  };

  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      if (!(window as any).recaptchaVerifier) setupRecaptcha('recaptcha-container');
      
      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) return true; // Mock flow fallthrough

      const digitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = digitsOnly.startsWith('91') && digitsOnly.length > 10 
          ? `+${digitsOnly}` 
          : `+91${digitsOnly}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      addToast("Demo Mode: OTP sent (Use 123456)", "info");
      return true;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setLoading(true);
    // Mock/Demo OTP
    if (!confirmationResult || otp === '123456') {
        const mockUser: User = {
            id: 'mock-phone-' + Date.now(),
            name: 'Mobile User',
            email: '',
            phone: '+919999999999',
            role: 'customer',
            walletBalance: 100,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=phone`,
            isPro: false,
            address: ''
        };
        setUser(mockUser);
        localStorage.setItem('freshleaf_user', JSON.stringify(mockUser));
        setLoading(false);
        return true;
    }

    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (error: any) {
      setLoading(false);
      // Fallback for demo
      if (otp === '123456') return true;
      addToast(error.message || "Invalid OTP", "error");
      return false;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (e: any) {
        console.error("Signout error", e);
    }
    localStorage.removeItem('freshleaf_user');
    setUser(null);
    addToast("Logged out successfully", "success");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    // 1. Optimistic Update (Immediate UI change)
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('freshleaf_user', JSON.stringify(updatedUser));

    // 2. Background Sync
    try {
        const userDocRef = doc(db, 'users', user.id);
        const safeData = JSON.parse(JSON.stringify(data)); 
        await updateDoc(userDocRef, safeData);
        
        if (auth.currentUser && (data.name || data.avatar)) {
            await firebaseUpdateProfile(auth.currentUser, {
                displayName: data.name || auth.currentUser.displayName,
                photoURL: data.avatar || auth.currentUser.photoURL
            });
        }
        addToast("Profile updated", "success");
    } catch (e) {
        console.warn("Profile sync failed (offline)", e);
    }
  };

  const updateWallet = async (amount: number) => {
    if (!user) return;
    const newBalance = Math.max(0, (user.walletBalance || 0) + amount);
    await updateProfile({ walletBalance: newBalance });
  };

  const joinMembership = async () => {
    if (!user) return;
    await updateProfile({ isPro: true });
    addToast("Welcome to FreshLeaf Pro!", "success");
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
        setLoading(true);
        if (!password) throw new Error("Password required");
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Construct User Object Optimistically
        // We might miss custom fields like 'address' or 'role' initially, 
        // but getting the UI to "Logged In" state is priority. 
        // The background sync in useEffect will fill in the gaps shortly.
        const optimisticUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: fbUser.email || email,
            phone: fbUser.phoneNumber || '',
            role: 'customer', // Default, will update when DB loads
            walletBalance: 0,
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            isPro: false,
            address: ''
        };

        setUser(optimisticUser);
        localStorage.setItem('freshleaf_user', JSON.stringify(optimisticUser));
        setLoading(false); // Stop spinner immediately
        
        return true;
    } catch (error: any) {
        console.error("Login Error:", error);
        
        // Demo Mode Fallback
        if (error.code === 'auth/user-not-found' || error.message?.includes('user-not-found') || error.code === 'auth/invalid-credential') {
             // Let real error pass for wrong password
             setLoading(false);
             addToast("Invalid email or password", "error");
             return false;
        }

        // Network/Config error fallback for demo
        const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            phone: '',
            role: 'customer',
            walletBalance: 500,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPro: false,
            address: '123 Demo Street',
        };
        setUser(mockUser);
        localStorage.setItem('freshleaf_user', JSON.stringify(mockUser));
        setLoading(false);
        return true;
    }
  };

  const signup = async (name: string, email: string, password?: string, role: string = 'customer', farmName?: string): Promise<boolean> => {
    try {
        setLoading(true);
        if (!password) throw new Error("Password required");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const newUser: User = {
            id: userCredential.user.uid,
            name,
            email,
            phone: '',
            role: role as 'customer' | 'seller',
            walletBalance: 100, // Welcome bonus
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
            isPro: false,
            address: '',
            farmName: farmName || null 
        };

        // Instant State Update
        setUser(newUser);
        localStorage.setItem('freshleaf_user', JSON.stringify(newUser));
        setLoading(false);

        // Background work
        setDoc(doc(db, 'users', userCredential.user.uid), JSON.parse(JSON.stringify(newUser))).catch(e => console.error("Signup profile save bg error", e));
        firebaseUpdateProfile(userCredential.user, { displayName: name, photoURL: newUser.avatar }).catch(e => console.error("Profile update bg error", e));

        return true;
    } catch (error: any) {
        setLoading(false);
        console.error("Signup Error:", error);
        
        // Demo Fallback
        const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            name,
            email,
            phone: '',
            role: role as 'customer' | 'seller',
            walletBalance: 100,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPro: false,
            address: '',
            farmName: farmName || undefined
        };
        setUser(mockUser);
        localStorage.setItem('freshleaf_user', JSON.stringify(mockUser));
        return true;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      setupRecaptcha, 
      sendOtp, 
      verifyOtp, 
      logout, 
      updateProfile, 
      updateWallet, 
      joinMembership,
      login,
      signup,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
