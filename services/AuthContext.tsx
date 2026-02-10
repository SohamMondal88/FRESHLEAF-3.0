
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User } from '../types';
import { auth, db } from './firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setupRecaptcha: (elementId: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateWallet: (amount: number) => Promise<void>;
  joinMembership: () => Promise<void>;
  login: (email: string, password?: string, role?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, role?: string, farmName?: string, phone?: string, gender?: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const { addToast } = useToast();

  // 1. Sync with Firebase (Background Validation)
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn("Auth persistence setup failed:", error);
      }

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const baseUser: User = {
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

          setUser(baseUser);
          setLoading(false);

          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc && userDoc.exists()) {
              setUser({ id: fbUser.uid, ...userDoc.data() } as User);
            } else {
              await setDoc(userDocRef, JSON.parse(JSON.stringify(baseUser)));
            }
          } catch (error) {
            console.error("Profile sync error:", error);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      });
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  const setupRecaptcha = async (elementId: string) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (recaptchaRef.current) {
            return;
        }

        recaptchaRef.current = new RecaptchaVerifier(auth, elementId, {
            size: 'normal',
            callback: () => console.log("Recaptcha verified"),
            'expired-callback': () => {
              if (recaptchaRef.current) {
                recaptchaRef.current.clear();
                recaptchaRef.current = null;
              }
              console.log("Recaptcha expired");
            }
        });
        await recaptchaRef.current.render();
    } catch (error) {
        console.error("Error setting up Recaptcha:", error);
    }
  };

  const sendOtp = async (phone: string): Promise<boolean> => {
    try {
      await setupRecaptcha('recaptcha-container');
      const appVerifier = recaptchaRef.current;
      if (!appVerifier) throw new Error("Recaptcha verifier not initialized");

      const digitsOnly = phone.replace(/\D/g, '');
      const formattedPhone = digitsOnly.startsWith('91') && digitsOnly.length > 10 
          ? `+${digitsOnly}` 
          : `+91${digitsOnly}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return true;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      if (error.code === 'auth/invalid-phone-number') {
        addToast("Invalid phone number. Please check the format.", "error");
      } else if (error.code === 'auth/too-many-requests') {
        addToast("Too many attempts. Please wait a bit and try again.", "error");
      } else if (error.code === 'auth/captcha-check-failed') {
        addToast("Recaptcha failed. Please refresh and retry.", "error");
      } else if (error.code === 'auth/operation-not-allowed') {
        addToast("Phone auth is disabled in Firebase. Please enable it in the console.", "error");
      } else {
        addToast(error.message || "Unable to send OTP. Please try again.", "error");
      }
      return false;
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!confirmationResult) throw new Error("OTP session expired. Please request a new code.");

      const cleanOtp = otp.trim();
      if (!/^\d{6}$/.test(cleanOtp)) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      await confirmationResult.confirm(cleanOtp);
      setLoading(false);
      return true;
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/invalid-verification-code') {
        addToast('Invalid OTP. Please re-check the code or request a new OTP.', 'error');
      } else if (error.code === 'auth/code-expired') {
        addToast('OTP expired. Please request a new one.', 'error');
      } else {
        addToast(error.message || "Invalid OTP", "error");
      }
      return false;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (e: any) {
        console.error("Signout error", e);
    }
    setUser(null);
    addToast("Logged out successfully", "success");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);

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
        
        await signInWithEmailAndPassword(auth, email, password);
        setLoading(false);
        
        return true;
    } catch (error: any) {
        console.error("Login Error:", error);
        setLoading(false);
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             addToast("Invalid email or password", "error");
             return false;
        }

        addToast("Login failed. Please try again.", "error");
        return false;
    }
  };

  const googleLogin = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);

      const baseUser: User = {
        id: credential.user.uid,
        name: credential.user.displayName || 'FreshLeaf User',
        email: credential.user.email || '',
        phone: credential.user.phoneNumber || '',
        role: 'customer',
        walletBalance: 0,
        avatar: credential.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${credential.user.uid}`,
        isPro: false,
        address: ''
      };

      await setDoc(doc(db, 'users', credential.user.uid), JSON.parse(JSON.stringify(baseUser)), { merge: true });
      setLoading(false);
      return true;
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/popup-closed-by-user') {
        addToast('Google login was cancelled.', 'info');
      } else if (error.code === 'auth/operation-not-allowed') {
        addToast('Google provider is disabled in Firebase console.', 'error');
      } else {
        addToast(error.message || 'Google login failed', 'error');
      }
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    role: string = 'customer',
    farmName?: string,
    phone?: string,
    gender?: string
  ): Promise<boolean> => {
    try {
        setLoading(true);
        if (!password) throw new Error("Password required");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const newUser: User = {
            id: userCredential.user.uid,
            name,
            email,
            phone: phone || '',
            gender: gender || undefined,
            role: role as 'customer' | 'seller',
            walletBalance: 0, 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`,
            isPro: false,
            address: '',
            farmName: farmName || null // FIX: Use null instead of undefined for Firestore
        };

        setUser(newUser);
        setLoading(false);

        await setDoc(doc(db, 'users', userCredential.user.uid), JSON.parse(JSON.stringify(newUser)));
        await firebaseUpdateProfile(userCredential.user, { displayName: name, photoURL: newUser.avatar });

        return true;
    } catch (error: any) {
        setLoading(false);
        console.error("Signup Error:", error);

        if (error.code === 'auth/email-already-in-use') {
            addToast("Email already registered", "error");
        } else {
            addToast("Signup failed", "error");
        }
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
      googleLogin,
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
