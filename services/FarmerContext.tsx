import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Farmer } from '../types';
import { db } from './firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface FarmerContextType {
  farmers: Farmer[];
  loading: boolean;
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

export const FarmerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'farmers'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedFarmers = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Farmer));
        setFarmers(fetchedFarmers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching farmers:", error);
        addToast("Unable to load farmer profiles.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [addToast]);

  return (
    <FarmerContext.Provider value={{ farmers, loading }}>
      {children}
    </FarmerContext.Provider>
  );
};

export const useFarmer = () => {
  const context = useContext(FarmerContext);
  if (!context) throw new Error('useFarmer must be used within a FarmerProvider');
  return context;
};
