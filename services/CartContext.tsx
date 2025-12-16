import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedUnit?: string, pricePerUnit?: number) => void;
  removeFromCart: (productId: string, selectedUnit: string) => void;
  updateQuantity: (productId: string, selectedUnit: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  // Wishlist props
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { addToast } = useToast();

  // Load wishlist from local storage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('freshleaf_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) { console.error("Error parsing wishlist", e); }
    }
  }, []);

  // Save wishlist on change
  useEffect(() => {
    localStorage.setItem('freshleaf_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, selectedUnit = '1kg', pricePerUnit?: number) => {
    const finalPrice = pricePerUnit || product.price; 
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedUnit === selectedUnit);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedUnit === selectedUnit 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedUnit, price: finalPrice }];
    });
    addToast(`Added ${quantity} x ${product.name.en} to Cart`, 'success');
  };

  const removeFromCart = (productId: string, selectedUnit: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedUnit === selectedUnit)));
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, selectedUnit: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item => (item.id === productId && item.selectedUnit === selectedUnit ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Wishlist Logic
  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      addToast(`${product.name.en} added to Wishlist`, 'success');
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
    addToast('Removed from Wishlist', 'info');
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
      wishlist, addToWishlist, removeFromWishlist, isInWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
