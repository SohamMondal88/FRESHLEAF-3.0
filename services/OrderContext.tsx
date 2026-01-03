
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';

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
  // ... other agents
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Real-time Order Listener
  useEffect(() => {
    if (!user) {
        setOrders([]);
        return;
    }

    const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [user]);

  const createOrder = async (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string, instructions: string[]) => {
    if (!user) throw new Error("User not logged in");

    const assignedAgent = MY_AGENTS[Math.floor(Math.random() * MY_AGENTS.length)];
    
    const newOrderData = {
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

    const docRef = await addDoc(collection(db, 'orders'), newOrderData);
    return docRef.id;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  };

  const cancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'Cancelled');
    return true;
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const generateInvoice = (order: Order) => {
    console.log("Invoice generation logic here");
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
