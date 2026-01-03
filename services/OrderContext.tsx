
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string, instructions: string[]) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderById: (id: string) => Order | undefined;
  generateInvoice: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const MY_AGENTS: DeliveryAgent[] = [
  { name: "Rohan Das", phone: "+91 98765 11111", vehicleNumber: "WB-02-AB-1234", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9 },
  { name: "Amit Singh", phone: "+91 98765 22222", vehicleNumber: "DL-04-XY-5678", avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 4.8 }
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const { addToast } = useToast();

  // Real-time Order Listener
  useEffect(() => {
    if (!user) {
        setOrders([]);
        return;
    }

    // Query orders where userId matches OR sellerId is relevant (for sellers, simplified here)
    const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
    );

    // If the user is a seller, we might want to fetch orders containing their items.
    // However, Firestore array-contains queries are specific. 
    // For simplicity in this demo, we'll just fetch user's own orders here.
    // Sellers would typically query based on a separate "sellerOrders" subcollection or field index.

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
    }, (error) => {
        console.error("Error fetching orders:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const createOrder = async (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string, instructions: string[]) => {
    if (!user) throw new Error("User not logged in");

    const assignedAgent = MY_AGENTS[Math.floor(Math.random() * MY_AGENTS.length)];
    const newOrderId = 'ORD-' + Date.now();
    
    const newOrderData: Order = {
      id: newOrderId,
      userId: user.id,
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: Date.now(),
      total,
      status: 'Processing',
      items,
      paymentMethod,
      address,
      instructions,
      trackingId: 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      courier: 'FreshLeaf Courier',
      agent: assignedAgent,
      customerName: name,
      customerPhone: phone
    };

    try {
        await setDoc(doc(db, 'orders', newOrderId), newOrderData);
        return newOrderId;
    } catch (error) {
        console.error("Create order error", error);
        addToast("Failed to place order", "error");
        throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
        addToast(`Order status updated to ${status}`, "info");
    } catch (error) {
        console.error("Update status error", error);
        addToast("Failed to update status", "error");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
        await updateOrderStatus(orderId, 'Cancelled');
        return true;
    } catch (error) {
        return false;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const generateInvoice = (order: Order) => {
    console.log("Invoice generation logic here for", order.id);
    addToast("Invoice download started...", "info");
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, updateOrderStatus, cancelOrder, getOrderById, generateInvoice }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
    