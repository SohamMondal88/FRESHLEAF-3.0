
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from './ToastContext';

interface ImageContextType {
  customImages: Record<string, string>;
  uploadImage: (productId: string, file: File) => Promise<string | null>;
  removeImage: (productId: string) => void;
  getProductImage: (productId: string, defaultImage: string) => string;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const uploadImage = async (productId: string, file: File): Promise<string | null> => {
    try {
      // Create a reference to 'images/productId-timestamp'
      const storageRef = ref(storage, `products/${productId}-${Date.now()}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setCustomImages(prev => ({
        ...prev,
        [productId]: downloadURL
      }));
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast("Failed to upload image to storage", "error");
      return null;
    }
  };

  const removeImage = (productId: string) => {
    setCustomImages(prev => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const getProductImage = (productId: string, defaultImage: string) => {
    return customImages[productId] || defaultImage;
  };

  return (
    <ImageContext.Provider value={{ customImages, uploadImage, removeImage, getProductImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error('useImage must be used within an ImageProvider');
  return context;
};
    