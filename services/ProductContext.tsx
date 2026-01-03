
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, writeBatch, query } from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  seedDatabase: () => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetchedProducts);
      } else {
        // Fallback or seed opportunity
        setProducts(INITIAL_PRODUCTS);
      }
    };
    fetchProducts();
  }, []);

  // Utility to seed Firestore with constants (Run once)
  const seedDatabase = async () => {
    const batch = writeBatch(db);
    INITIAL_PRODUCTS.forEach(p => {
        const ref = doc(db, 'products', p.id);
        batch.set(ref, p);
    });
    await batch.commit();
    console.log("Database seeded!");
    // Refresh
    setProducts(INITIAL_PRODUCTS);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    // Implement Firestore update logic here if needed
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
  };

  const addProduct = (newProductData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    // Placeholder for local state update
    const newProduct: Product = {
        ...newProductData,
        id: 'p-' + Date.now(),
        rating: 0,
        reviews: 0,
        inStock: true,
        gallery: newProductData.gallery.length > 0 ? newProductData.gallery : [newProductData.image]
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  return (
    <ProductContext.Provider value={{ products, seedDatabase, updateProduct, bulkUpdateProducts, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within a ProductProvider');
  return context;
};
