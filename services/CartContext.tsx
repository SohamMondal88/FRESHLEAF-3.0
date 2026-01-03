
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface BillDetails {
  itemTotal: number;
  handlingFee: number;
  platformFee: number;
  deliveryFee: number;
  smallCartFee: number;
  tip: number;
  discount: number;
  finalTotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedUnit?: string, pricePerUnit?: number) => void;
  removeFromCart: (productId: string, selectedUnit: string) => void;
  updateQuantity: (productId: string, selectedUnit: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  bill: BillDetails;
  setTip: (amount: number) => void;
  tip: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [tip, setTip] = useState(0);
  const { user } = useAuth();
  const { addToast } = useToast();

  // Sync Cart with Firestore
  useEffect(() => {
    if (user) {
      const cartRef = doc(db, 'carts', user.id);
      const unsubscribe = onSnapshot(cartRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setCartItems(data.items || []);
          setTip(data.tip || 0);
        }
      });
      return () => unsubscribe();
    } else {
      // Local storage fallback for guest
      const localCart = localStorage.getItem('freshleaf_cart');
      if (localCart) setCartItems(JSON.parse(localCart));
    }
  }, [user]);

  // Persist Cart Logic
  const saveCart = async (items: CartItem[], currentTip: number) => {
    if (user) {
      await setDoc(doc(db, 'carts', user.id), { items, tip: currentTip, updatedAt: Date.now() }, { merge: true });
    } else {
      localStorage.setItem('freshleaf_cart', JSON.stringify(items));
      setCartItems(items);
    }
  };

  const addToCart = (product: Product, quantity = 1, selectedUnit = '1kg', pricePerUnit?: number) => {
    const finalPrice = pricePerUnit || product.price; 
    const newItems = [...cartItems];
    const existingIdx = newItems.findIndex(item => item.id === product.id && item.selectedUnit === selectedUnit);

    if (existingIdx > -1) {
      newItems[existingIdx].quantity += quantity;
    } else {
      newItems.push({ ...product, quantity, selectedUnit, price: finalPrice });
    }
    
    saveCart(newItems, tip);
    addToast(`Added ${quantity} x ${product.name.en}`, 'success');
  };

  const removeFromCart = (productId: string, selectedUnit: string) => {
    const newItems = cartItems.filter(item => !(item.id === productId && item.selectedUnit === selectedUnit));
    saveCart(newItems, tip);
  };

  const updateQuantity = (productId: string, selectedUnit: string, quantity: number) => {
    if (quantity < 1) return;
    const newItems = cartItems.map(item => 
      (item.id === productId && item.selectedUnit === selectedUnit) ? { ...item, quantity } : item
    );
    saveCart(newItems, tip);
  };

  const clearCart = () => {
    saveCart([], 0);
  };

  const handleSetTip = (amount: number) => {
    setTip(amount);
    saveCart(cartItems, amount);
  };

  // Bill Calculation Logic
  const bill = useMemo(() => {
    const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const handlingFee = 4;
    const platformFee = 2;
    const deliveryFee = itemTotal > 200 ? 0 : 25;
    const smallCartFee = itemTotal < 100 && itemTotal > 0 ? 20 : 0;
    
    return {
      itemTotal,
      handlingFee,
      platformFee,
      deliveryFee,
      smallCartFee,
      tip,
      discount: 0,
      finalTotal: itemTotal + handlingFee + platformFee + deliveryFee + smallCartFee + tip
    };
  }, [cartItems, tip]);

  // Wishlist Logic (Local Only for now as requested by user to focus on Order/Auth/Products in FireStore)
  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    addToast("Added to wishlist", "success");
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
    addToast("Removed from wishlist", "info");
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal: bill.itemTotal, bill, setTip: handleSetTip, tip,
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
    