
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
              // Create default profile for new phone users
              const newUser: User = {
                id: fbUser.uid,
                name: 'FreshLeaf User',
                email: fbUser.email || '',
                phone: fbUser.phoneNumber || '',
                role: 'customer',
                walletBalance: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`,
                isPro: false,
                address: ''
              };
              await setDoc(userDocRef, newUser);
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
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (elementId: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Recaptcha container '${elementId}' not found in DOM.`);
            return;
        }

        // Clear existing verifier if it exists
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch(e) { /* ignore clear error */ }
            (window as any).recaptchaVerifier = null;
        }

        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': () => {
                console.log("Recaptcha verified");
            },
            'expired-callback': () => {
                console.log("Recaptcha expired");
            }
        });
    } catch (error) {
        console.error("Error setting up Recaptcha:", error);
    }
  };

  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      if (!(window as any).recaptchaVerifier) {
          // Try to late-bind if missing (e.g. strict mode race condition)
          setupRecaptcha('recaptcha-container');
      }
      
      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
          console.error("Recaptcha not initialized. Please refresh and try again.");
          return false;
      }

      // Ensure pure digits and correct format
      const digitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = digitsOnly.startsWith('91') && digitsOnly.length > 10 
          ? `+${digitsOnly}` 
          : `+91${digitsOnly}`;
      
      console.log("Sending OTP to:", formattedPhone);
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      
      // Handle common errors specifically
      if (error.code === 'auth/internal-error') {
          console.error("Auth Internal Error. Ensure 'localhost' is added to Authorized Domains in Firebase Console.");
      } else if (error.code === 'auth/invalid-phone-number') {
          console.error("Invalid phone number format.");
      }

      // Reset recaptcha on error so user can try again
      if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch(e) {}
          (window as any).recaptchaVerifier = null;
          setupRecaptcha('recaptcha-container');
      }
      return false;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    if (!confirmationResult) return false;
    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, data);
    setUser(prev => prev ? { ...prev, ...data } : null);
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
        return false;
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
