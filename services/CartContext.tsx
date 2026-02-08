
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { BillDetails, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedUnit?: string, pricePerUnit?: number) => void;
  removeFromCart: (productId: string, selectedUnit: string) => void;
  updateQuantity: (productId: string, selectedUnit: string, quantity: number) => void;
  clearCart: () => void;
  bill: BillDetails;
  setTip: (amount: number) => void;
  tip: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  // 1. Sync Cart & Wishlist with Firestore
  useEffect(() => {
    let unsubscribeCart = () => {};
    let unsubscribeWishlist = () => {};

    if (user) {
      setLoading(true);
      // Cart Listener
      const cartRef = doc(db, 'carts', user.id);
      unsubscribeCart = onSnapshot(cartRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setCartItems(data.items || []);
          setTip(data.tip || 0);
        } else {
          setCartItems([]);
          setTip(0);
        }
        setLoading(false);
      });

      // Wishlist Listener
      const wishlistRef = doc(db, 'wishlists', user.id);
      unsubscribeWishlist = onSnapshot(wishlistRef, (doc) => {
        if (doc.exists()) {
          setWishlist(doc.data().items || []);
        } else {
          setWishlist([]);
        }
      });
    } else {
      setCartItems([]);
      setWishlist([]);
      setTip(0);
      setLoading(false);
    }

    return () => {
      unsubscribeCart();
      unsubscribeWishlist();
    };
  }, [user]);

  // 2. Persistence Logic
  const saveCartToFirestore = async (items: CartItem[], currentTip: number) => {
    if (!user) return;
    const cartRef = doc(db, 'carts', user.id);
    await setDoc(cartRef, { items, tip: currentTip, updatedAt: Date.now() }, { merge: true });
  };

  const saveWishlistToFirestore = async (items: Product[]) => {
    if (!user) return;
    const wishlistRef = doc(db, 'wishlists', user.id);
    await setDoc(wishlistRef, { items, updatedAt: Date.now() }, { merge: true });
  };

  // 3. Cart Actions
  const addToCart = (product: Product, quantity = 1, selectedUnit = '1kg', pricePerUnit?: number) => {
    if (!user) {
      addToast("Please login to add items to cart", "info");
      return;
    }
    const finalPrice = pricePerUnit || product.price; 
    const newItems = [...cartItems];
    const existingIdx = newItems.findIndex(item => item.id === product.id && item.selectedUnit === selectedUnit);

    if (existingIdx > -1) {
      newItems[existingIdx].quantity += quantity;
    } else {
      newItems.push({ ...product, quantity, selectedUnit, price: finalPrice });
    }
    
    setCartItems(newItems); // Optimistic update
    saveCartToFirestore(newItems, tip);
    addToast(`Added ${quantity} x ${product.name.en}`, 'success');
  };

  const removeFromCart = (productId: string, selectedUnit: string) => {
    if (!user) {
      addToast("Please login to manage your cart", "info");
      return;
    }
    const newItems = cartItems.filter(item => !(item.id === productId && item.selectedUnit === selectedUnit));
    setCartItems(newItems);
    saveCartToFirestore(newItems, tip);
  };

  const updateQuantity = (productId: string, selectedUnit: string, quantity: number) => {
    if (quantity < 1) return;
    if (!user) {
      addToast("Please login to manage your cart", "info");
      return;
    }
    const newItems = cartItems.map(item => 
      (item.id === productId && item.selectedUnit === selectedUnit) ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    saveCartToFirestore(newItems, tip);
  };

  const clearCart = () => {
    if (!user) {
      setCartItems([]);
      setTip(0);
      return;
    }
    setCartItems([]);
    setTip(0);
    saveCartToFirestore([], 0);
  };

  const handleSetTip = (amount: number) => {
    setTip(amount);
    saveCartToFirestore(cartItems, amount);
  };

  // 4. Wishlist Actions
  const addToWishlist = (product: Product) => {
    if (!user) {
      addToast("Please login to use wishlist", "info");
      return;
    }
    const newWishlist = [...wishlist];
    if (!newWishlist.some(p => p.id === product.id)) {
      newWishlist.push(product);
      setWishlist(newWishlist);
      saveWishlistToFirestore(newWishlist);
      addToast("Added to wishlist", "success");
    }
  };

  const removeFromWishlist = (productId: string) => {
    if (!user) {
      addToast("Please login to use wishlist", "info");
      return;
    }
    const newWishlist = wishlist.filter(p => p.id !== productId);
    setWishlist(newWishlist);
    saveWishlistToFirestore(newWishlist);
    addToast("Removed from wishlist", "info");
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  // 5. Detailed Bill Logic
  const bill = useMemo(() => {
    const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // Calculate MRP total (assuming oldPrice exists, else use price)
    const mrpTotal = cartItems.reduce((acc, item) => {
        const itemMrp = item.oldPrice ? item.oldPrice : item.price;
        return acc + (itemMrp * item.quantity);
    }, 0);

    const discount = mrpTotal - itemTotal;
    
    const handlingFee = itemTotal > 0 ? 4 : 0;
    const platformFee = itemTotal > 0 ? 2 : 0;
    
    // Free delivery above ₹499
    const deliveryFee = itemTotal > 0 ? (itemTotal > 499 ? 0 : 35) : 0;
    
    // Small cart fee if total < ₹100
    const smallCartFee = (itemTotal > 0 && itemTotal < 100) ? 20 : 0;
    
    const grandTotal = itemTotal + handlingFee + platformFee + deliveryFee + smallCartFee + tip;

    return {
      mrpTotal,
      itemTotal,
      discount,
      handlingFee,
      platformFee,
      deliveryFee,
      smallCartFee,
      tip,
      grandTotal
    };
  }, [cartItems, tip]);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      bill, setTip: handleSetTip, tip,
      wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading
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
