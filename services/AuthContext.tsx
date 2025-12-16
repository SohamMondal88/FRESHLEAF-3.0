import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'customer' | 'seller') => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: 'customer' | 'seller', farmName?: string) => Promise<boolean>;
  socialLogin: (provider: string, email: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateWallet: (amount: number) => void;
  joinMembership: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('freshleaf_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsers = (): User[] => {
    const users = localStorage.getItem('freshleaf_users_db');
    return users ? JSON.parse(users) : [];
  };

  const login = async (email: string, password: string, role: 'customer' | 'seller' = 'customer') => {
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    // Simple matching (In real app, password would be hashed)
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (foundUser) {
      // Ensure walletBalance exists
      if (foundUser.walletBalance === undefined) foundUser.walletBalance = 0;
      
      setUser(foundUser);
      localStorage.setItem('freshleaf_current_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const socialLogin = async (provider: string, email: string, name: string) => {
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    let foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      // Create new user if not exists
      foundUser = {
        id: 'usr_' + Date.now(),
        name,
        email,
        phone: '',
        isPro: false,
        role: 'customer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
        walletBalance: 0
      };
      const updatedUsers = [...users, foundUser];
      localStorage.setItem('freshleaf_users_db', JSON.stringify(updatedUsers));
    } else {
        if (foundUser.walletBalance === undefined) foundUser.walletBalance = 0;
    }

    setUser(foundUser);
    localStorage.setItem('freshleaf_current_user', JSON.stringify(foundUser));
    return true;
  };

  const signup = async (name: string, email: string, password: string, role: 'customer' | 'seller' = 'customer', farmName?: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false; // User exists
    }

    const newUser: User = {
      id: role === 'seller' ? 'sel_' + Date.now() : 'usr_' + Date.now(),
      name,
      email,
      phone: '',
      isPro: false,
      role: role,
      farmName: farmName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      walletBalance: 0
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('freshleaf_users_db', JSON.stringify(updatedUsers));
    
    // Auto login after signup
    setUser(newUser);
    localStorage.setItem('freshleaf_current_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshleaf_current_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    
    // Update Session
    setUser(updatedUser);
    localStorage.setItem('freshleaf_current_user', JSON.stringify(updatedUser));

    // Update DB
    const users = getUsers();
    const dbIndex = users.findIndex(u => u.id === user.id);
    if (dbIndex > -1) {
      users[dbIndex] = updatedUser;
      localStorage.setItem('freshleaf_users_db', JSON.stringify(users));
    }
  };

  const updateWallet = (amount: number) => {
    if (!user) return;
    // Keep 2 decimal places for points
    const newBalance = parseFloat((Math.max(0, (user.walletBalance || 0) + amount)).toFixed(2));
    updateProfile({ walletBalance: newBalance });
  };

  const joinMembership = () => {
    updateProfile({ isPro: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, socialLogin, logout, updateProfile, updateWallet, joinMembership, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};