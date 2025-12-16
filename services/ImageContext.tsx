import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ImageContextType {
  customImages: Record<string, string>;
  uploadImage: (productId: string, file: File) => Promise<void>;
  removeImage: (productId: string) => void;
  getProductImage: (productId: string, defaultImage: string) => string;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  // Load images from local storage on mount
  useEffect(() => {
    const storedImages = localStorage.getItem('freshleaf_custom_images');
    if (storedImages) {
      try {
        setCustomImages(JSON.parse(storedImages));
      } catch (e) {
        console.error("Failed to parse custom images", e);
      }
    }
  }, []);

  const uploadImage = (productId: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomImages(prev => {
          const updated = { ...prev, [productId]: base64String };
          try {
            localStorage.setItem('freshleaf_custom_images', JSON.stringify(updated));
          } catch (err) {
            alert("Image is too large for browser storage. Please try a smaller image.");
            return prev;
          }
          return updated;
        });
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (productId: string) => {
    setCustomImages(prev => {
      const updated = { ...prev };
      delete updated[productId];
      localStorage.setItem('freshleaf_custom_images', JSON.stringify(updated));
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