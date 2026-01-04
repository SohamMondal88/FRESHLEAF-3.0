
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PincodeContextType {
  pincode: string | null;
  isServiceable: boolean;
  setPincode: (code: string) => Promise<boolean>;
  detectLocation: () => Promise<{ success: boolean; message?: string }>;
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
      setIsServiceable(true); 
    } else {
      // Prompt user on first visit
      const timer = setTimeout(() => setShowModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const validatePincode = (code: string) => {
    // Strictly match 743372
    return code === '743372';
  };

  const setPincode = async (code: string) => {
    // Simulate Backend API Call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (validatePincode(code)) {
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

  const detectLocation = async (): Promise<{ success: boolean; message?: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: "Geolocation is not supported by your browser." };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap (Nominatim) for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          // Extract postcode
          const detectedPincode = data.address?.postcode?.replace(/\D/g, ''); // Remove non-digits

          if (detectedPincode) {
            if (validatePincode(detectedPincode)) {
              setPincodeState(detectedPincode);
              setIsServiceable(true);
              localStorage.setItem('freshleaf_pincode', detectedPincode);
              setShowModal(false);
              resolve({ success: true });
            } else {
              resolve({ success: false, message: `We do not deliver to ${detectedPincode} yet. Only 743372.` });
            }
          } else {
            resolve({ success: false, message: "Could not detect pincode from location." });
          }
        } catch (error) {
          console.error(error);
          resolve({ success: false, message: "Failed to fetch location details." });
        }
      }, (error) => {
        let msg = "Location access denied.";
        if (error.code === error.TIMEOUT) msg = "Location request timed out.";
        resolve({ success: false, message: msg });
      });
    });
  };

  const resetPincode = () => {
    localStorage.removeItem('freshleaf_pincode');
    setPincodeState(null);
    setIsServiceable(false);
    setShowModal(true);
  };

  return (
    <PincodeContext.Provider value={{ pincode, isServiceable, setPincode, detectLocation, resetPincode, showModal, setShowModal }}>
      {children}
    </PincodeContext.Provider>
  );
};

export const usePincode = () => {
  const context = useContext(PincodeContext);
  if (!context) throw new Error('usePincode must be used within a PincodeProvider');
  return context;
};
