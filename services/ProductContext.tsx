
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product } from '../types';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, writeBatch, query, onSnapshot } from 'firebase/firestore';
import { useToast } from './ToastContext';
import { seedProducts } from '../data/seedProducts';

interface ProductContextType {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const autoSeedTriggeredRef = useRef(false);
  const autoSeedProducts = import.meta.env.VITE_AUTO_SEED_PRODUCTS === 'true';

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty && autoSeedProducts && !autoSeedTriggeredRef.current) {
          autoSeedTriggeredRef.current = true;
          try {
            const batch = writeBatch(db);
            seedProducts.forEach((product) => {
              batch.set(doc(db, 'products', product.id), product, { merge: true });
            });
            await batch.commit();
            addToast(`Seeded ${seedProducts.length} products to Firestore`, 'success');
          } catch (error) {
            console.error('Auto-seed failed:', error);
            addToast('Unable to seed default products. Please upload manually.', 'error');
          }
        }

        const fetchedProducts = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Product));
        setProducts(fetchedProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        addToast("Unable to load products. Please try again later.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [addToast, autoSeedProducts]);

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
    <ProductContext.Provider value={{ products, updateProduct, bulkUpdateProducts, addProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within a ProductProvider');
  return context;
};
