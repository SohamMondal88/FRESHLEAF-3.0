
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';
import { BillDetails } from './CartContext';

interface OrderContextType {
  orders: Order[];
  createOrder: (
      items: CartItem[], 
      billDetails: BillDetails, 
      address: string, 
      paymentMethod: string, 
      phone: string, 
      name: string, 
      instructions: string[],
      customInstruction?: string
  ) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderById: (id: string) => Order | undefined;
  generateInvoice: (order: Order) => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const MY_AGENTS: DeliveryAgent[] = [
  { name: "Rohan Das", phone: "+91 98765 11111", vehicleNumber: "WB-02-AB-1234", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.9 },
  { name: "Amit Singh", phone: "+91 98765 22222", vehicleNumber: "DL-04-XY-5678", avatar: "https://randomuser.me/api/portraits/men/45.jpg", rating: 4.8 }
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Real-time Order Listener from Firestore
  useEffect(() => {
    if (!user) {
        setOrders([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createOrder = async (
      items: CartItem[], 
      billDetails: BillDetails, 
      address: string, 
      paymentMethod: string, 
      phone: string, 
      name: string, 
      instructions: string[],
      customInstruction?: string
  ) => {
    if (!user) throw new Error("User not logged in");

    const assignedAgent = MY_AGENTS[Math.floor(Math.random() * MY_AGENTS.length)];
    const newOrderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    
    // Merge predefined and custom instructions
    const finalInstructions = [...instructions];
    if (customInstruction) finalInstructions.push(customInstruction);

    const newOrderData: Order & { billBreakdown: BillDetails } = {
      id: newOrderId,
      userId: user.id,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: Date.now(),
      total: billDetails.grandTotal,
      billBreakdown: billDetails,
      status: 'Processing',
      items,
      paymentMethod,
      address,
      instructions: finalInstructions,
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
    // In a real app, this would generate a PDF
    console.log("Invoice generation for", order.id);
    addToast("Invoice downloaded successfully", "success");
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, updateOrderStatus, cancelOrder, getOrderById, generateInvoice, loading }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
