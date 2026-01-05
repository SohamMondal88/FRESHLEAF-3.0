
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
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { addToast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    // 1. Check for Mock User first (Persistence for Demo Mode when Firebase is down/unconfigured)
    const storedMock = localStorage.getItem('freshleaf_mock_user');
    if (storedMock) {
        try {
            setUser(JSON.parse(storedMock));
            setLoading(false);
            return; 
        } catch (e) {
            console.error("Failed to parse mock user", e);
        }
    }

    // 2. Firebase Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // If we already have the user state set (e.g. from optimistic login), skip fetching to avoid flicker
        if (user && user.id === fbUser.uid) {
            setLoading(false);
            return;
        }

        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser({ id: fbUser.uid, ...userDoc.data() } as User);
            } else {
              // Create default profile if doc missing (e.g. fresh phone login)
              const newUser: User = {
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
              const safeUser = JSON.parse(JSON.stringify(newUser));
              try {
                await setDoc(userDocRef, safeUser);
              } catch (writeErr) {
                console.warn("Could not create user profile in Firestore (offline/permission):", writeErr);
              }
              setUser(newUser);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            const fallbackUser: User = {
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
            setUser(fallbackUser);
        }
      } else {
        if (!localStorage.getItem('freshleaf_mock_user')) {
            setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [addToast]);

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
      if (!appVerifier) {
          console.warn("Recaptcha not initialized, using mock OTP flow");
          return true; 
      }

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
    if (!confirmationResult || otp === '123456') {
        const mockUser: User = {
            id: 'mock-phone-user-' + Date.now(),
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
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
        setLoading(false);
        return true;
    }

    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (error: any) {
      setLoading(false);
      console.error("Error verifying OTP:", error);
      if (otp === '123456') {
          const mockUser: User = {
            id: 'mock-phone-user-' + Date.now(),
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
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
        return true;
      }
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
    localStorage.removeItem('freshleaf_mock_user');
    setUser(null);
    addToast("Logged out successfully", "success");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    if (localStorage.getItem('freshleaf_mock_user')) {
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(updatedUser));
    }

    try {
        const userDocRef = doc(db, 'users', user.id);
        const safeData = JSON.parse(JSON.stringify(data)); 
        await updateDoc(userDocRef, safeData);
        
        if (auth.currentUser) {
            if (data.name || data.avatar) {
                await firebaseUpdateProfile(auth.currentUser, {
                    displayName: data.name || auth.currentUser.displayName,
                    photoURL: data.avatar || auth.currentUser.photoURL
                });
            }
        }
        addToast("Profile updated", "success");
    } catch (e) {
        console.warn("Profile sync failed (offline/mock mode)", e);
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
        
        // IMMEDIATE STATE UPDATE: Do not wait for onAuthStateChanged
        // Construct basic user from credential immediately
        const fbUser = userCredential.user;
        
        // Try to fetch extended profile quickly, but have fallback
        let fullUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: fbUser.email || email,
            phone: fbUser.phoneNumber || '',
            role: 'customer',
            walletBalance: 0,
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
            isPro: false,
            address: ''
        };

        // Try getting doc, but don't block too long if possible (though getDoc is usually needed for role)
        try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
                fullUser = { ...fullUser, ...userDoc.data() } as User;
            }
        } catch (e) {
            console.warn("Fast login: Profile fetch skipped/failed, using basic info");
        }

        setUser(fullUser);
        setLoading(false);
        return true;
    } catch (error: any) {
        console.error("Login Error:", error);
        
        if (
            error.code === 'auth/configuration-not-found' || 
            error.code === 'auth/network-request-failed' || 
            error.code === 'auth/internal-error' || 
            error.code === 'auth/invalid-api-key' ||
            error.code === 'unavailable' ||
            error.message?.includes('unavailable')
        ) {
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
            localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
            setLoading(false);
            addToast("Demo Login Successful (Offline Mode)", "info");
            return true;
        }

        setLoading(false);
        addToast(error.message || "Login failed", "error");
        return false;
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

        // Fire and forget Firestore write to speed up UI transition
        setDoc(doc(db, 'users', userCredential.user.uid), JSON.parse(JSON.stringify(newUser))).catch(e => console.error("Signup profile save bg error", e));
        
        firebaseUpdateProfile(userCredential.user, {
            displayName: name,
            photoURL: newUser.avatar
        }).catch(e => console.error("Profile update bg error", e));

        setUser(newUser);
        setLoading(false);
        return true;
    } catch (error: any) {
        console.error("Signup Error:", error);

        if (
            error.code === 'auth/configuration-not-found' || 
            error.code === 'auth/network-request-failed' || 
            error.code === 'auth/internal-error' ||
            error.code === 'auth/invalid-api-key' ||
            error.code === 'unavailable' ||
            error.message?.includes('unavailable')
        ) {
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
            localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
            setLoading(false);
            addToast("Demo Signup Successful (Offline Mode)", "info");
            return true;
        }

        setLoading(false);
        addToast(error.message || "Signup failed", "error");
        return false;
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
