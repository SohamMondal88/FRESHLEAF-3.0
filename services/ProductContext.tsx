import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => void;
  resetProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Initialize products from local storage or constants
  useEffect(() => {
    const storedProducts = localStorage.getItem('freshleaf_products_v1');
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (e) {
        console.error("Failed to parse products", e);
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('freshleaf_products_v1', JSON.stringify(products));
    }
  }, [products]);

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const bulkUpdateProducts = (ids: string[], updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, ...updates } : p));
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('freshleaf_products_v1');
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct, bulkUpdateProducts, resetProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within a ProductProvider');
  return context;
};