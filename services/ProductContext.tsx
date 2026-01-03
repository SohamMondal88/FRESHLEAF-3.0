
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, writeBatch, query } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface ProductContextType {
  products: Product[];
  seedDatabase: () => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetchedProducts);
      } else {
        // Automatically seed if empty
        seedDatabase();
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback for offline/error
      setProducts(INITIAL_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const seedDatabase = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(p => {
          const ref = doc(db, 'products', p.id);
          batch.set(ref, p);
      });
      await batch.commit();
      setProducts(INITIAL_PRODUCTS);
      console.log("Database seeded successfully!");
    } catch (e) {
      console.error("Error seeding database:", e);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
        const ref = doc(db, 'products', id);
        await updateDoc(ref, updates);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        addToast("Product updated", "success");
    } catch (error) {
        console.error("Error updating product:", error);
        addToast("Failed to update product", "error");
    }
  };

  const bulkUpdateProducts = async (ids: string[], updates: Partial<Product>) => {
    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, 'products', id);
            batch.update(ref, updates);
        });
        await batch.commit();
        setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
        addToast(`Updated ${ids.length} products`, "success");
    } catch (error) {
        console.error("Error bulk updating:", error);
        addToast("Failed to update products", "error");
    }
  };

  const addProduct = async (newProductData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    try {
        const newId = 'p-' + Date.now();
        const newProduct: Product = {
            ...newProductData,
            id: newId,
            rating: 0,
            reviews: 0,
            inStock: true,
            gallery: newProductData.gallery.length > 0 ? newProductData.gallery : [newProductData.image]
        };
        
        await setDoc(doc(db, 'products', newId), newProduct);
        setProducts(prev => [newProduct, ...prev]);
        addToast("Product added successfully", "success");
    } catch (error) {
        console.error("Error adding product:", error);
        addToast("Failed to add product", "error");
    }
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
    