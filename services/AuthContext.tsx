import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  joinMembership: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('freshleaf_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock login logic (accepts any password for demo if email matches stored or new)
    // In a real app, you would verify against a database
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      phone: '+91 98765 43210',
      isPro: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    
    setUser(mockUser);
    localStorage.setItem('freshleaf_user', JSON.stringify(mockUser));
    return true;
  };

  const signup = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone: '',
      isPro: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    setUser(newUser);
    localStorage.setItem('freshleaf_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshleaf_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('freshleaf_user', JSON.stringify(updatedUser));
  };

  const joinMembership = () => {
    if (!user) return;
    const updatedUser = { ...user, isPro: true };
    setUser(updatedUser);
    localStorage.setItem('freshleaf_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, joinMembership, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
