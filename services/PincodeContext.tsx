
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PincodeContextType {
  pincode: string | null;
  isServiceable: boolean;
  setPincode: (code: string) => Promise<boolean>;
  resetPincode: () => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export const PincodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pincode, setPincodeState] = useState<string | null>(null);
  const [isServiceable, setIsServiceable] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('freshleaf_pincode');
    if (stored) {
      setPincodeState(stored);
      setIsServiceable(true); // Assuming stored means valid
    } else {
      // Prompt user on first visit after a delay
      const timer = setTimeout(() => setShowModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const setPincode = async (code: string) => {
    // Simulate Backend API Call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Strict Logic: Must be 6 digits and start with '7433'
    // Regex: ^7433 verifies start, \d{2}$ verifies exactly 2 digits follow
    const isValid = /^(7433\d{2})$/.test(code);
    
    if (isValid) {
      setPincodeState(code);
      setIsServiceable(true);
      localStorage.setItem('freshleaf_pincode', code);
      setShowModal(false);
      return true;
    } else {
      setIsServiceable(false);
      return false;
    }
  };

  const resetPincode = () => {
    localStorage.removeItem('freshleaf_pincode');
    setPincodeState(null);
    setIsServiceable(false);
    setShowModal(true);
  };

  return (
    <PincodeContext.Provider value={{ pincode, isServiceable, setPincode, resetPincode, showModal, setShowModal }}>
      {children}
    </PincodeContext.Provider>
  );
};

export const usePincode = () => {
  const context = useContext(PincodeContext);
  if (!context) throw new Error('usePincode must be used within a PincodeProvider');
  return context;
};
