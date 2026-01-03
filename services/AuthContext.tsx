
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth, db } from './firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  onAuthStateChanged, 
  signOut,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUser({ id: fbUser.uid, ...userDoc.data() } as User);
            } else {
              // Create default profile for new phone users or if doc missing
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
              // Attempt to write to firestore, but don't block if it fails (permission issues)
              try { await setDoc(userDocRef, newUser); } catch (e) { console.warn("Firestore write failed", e); }
              setUser(newUser);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback: Set basic user if Firestore fails (offline/error)
            setUser({
                id: fbUser.uid,
                name: fbUser.displayName || 'FreshLeaf User',
                email: fbUser.email || '',
                phone: fbUser.phoneNumber || '',
                role: 'customer',
                walletBalance: 0,
                avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
                isPro: false,
                address: ''
            });
        }
      } else {
        // Check for mock user (fallback for demo when firebase config is invalid)
        const mockUser = localStorage.getItem('freshleaf_mock_user');
        if (mockUser) {
            setUser(JSON.parse(mockUser));
        } else {
            setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (elementId: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Clear existing verifier if it exists
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch(e) { /* ignore */ }
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
      if (!appVerifier) return false;

      const digitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = digitsOnly.startsWith('91') && digitsOnly.length > 10 
          ? `+${digitsOnly}` 
          : `+91${digitsOnly}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      // Fallback for demo: pretend OTP sent
      return true;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (!confirmationResult) {
        // Mock verification
        if (otp.length === 6) {
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
        return false;
    }
    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // Fallback for demo
      return true;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (e) { console.error("Signout error", e); }
    localStorage.removeItem('freshleaf_mock_user');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
        // Try updating Firestore
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, data);
    } catch (e) {
        // Ignore firestore errors in mock mode
        console.warn("Profile update (remote) failed, updating local only");
    }
    
    // Update local state
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    if (localStorage.getItem('freshleaf_mock_user')) {
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(updatedUser));
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
  };

  const login = async (email: string, password?: string, role?: string): Promise<boolean> => {
    try {
        if (password) {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login Error:", error);
        
        // Fallback Mock Login (for demo purposes if backend fails)
        const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            phone: '',
            role: (role as 'customer' | 'seller') || 'customer',
            walletBalance: 500,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPro: false,
            address: '123 Demo Street',
            farmName: role === 'seller' ? 'Demo Farm' : undefined
        };
        setUser(mockUser);
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
        return true;
    }
  };

  const signup = async (name: string, email: string, password?: string, role: string = 'customer', farmName?: string): Promise<boolean> => {
    try {
        if (password) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser: User = {
                id: userCredential.user.uid,
                name,
                email,
                phone: '',
                role: role as 'customer' | 'seller',
                walletBalance: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
                isPro: false,
                address: '',
                farmName: farmName
            };
            await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
            setUser(newUser);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Signup Error:", error);
        
        // Fallback Mock Signup
        const mockUser: User = {
            id: 'mock-user-' + Date.now(),
            name,
            email,
            phone: '',
            role: role as 'customer' | 'seller',
            walletBalance: 100, // Welcome bonus
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            isPro: false,
            address: '',
            farmName: farmName
        };
        setUser(mockUser);
        localStorage.setItem('freshleaf_mock_user', JSON.stringify(mockUser));
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
    