
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';
import { BillDetails } from './CartContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      customInstruction?: string,
      walletUsed?: number
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

const OWNER_PHONE = "+916297179823";

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateWallet } = useAuth();
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

  const sendSMS = (to: string, message: string) => {
      // Simulation of SMS Sending
      console.log(`[SMS SIMULATION] To: ${to} | Message: ${message}`);
      // In a real app, this would call a backend API (e.g., Twilio, Msg91)
  };

  const createOrder = async (
      items: CartItem[], 
      billDetails: BillDetails, 
      address: string, 
      paymentMethod: string, 
      phone: string, 
      name: string, 
      instructions: string[],
      customInstruction?: string,
      walletUsed: number = 0
  ) => {
    if (!user) throw new Error("User not logged in");

    const assignedAgent = MY_AGENTS[Math.floor(Math.random() * MY_AGENTS.length)];
    const newOrderId = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    
    // Merge predefined and custom instructions
    const finalInstructions = [...instructions];
    if (customInstruction) finalInstructions.push(customInstruction);

    // Calculate Points (10% of total bill amount)
    const pointsEarned = parseFloat((billDetails.grandTotal * 0.1).toFixed(2));

    const newOrderData: Order & { billBreakdown: BillDetails } = {
      id: newOrderId,
      userId: user.id,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: Date.now(),
      total: billDetails.grandTotal, // Total value of goods + fees
      billBreakdown: billDetails,
      status: 'Processing',
      items,
      paymentMethod, // e.g. "Wallet + Online" or just "COD"
      address,
      instructions: finalInstructions,
      trackingId: 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      courier: 'FreshLeaf Courier',
      agent: assignedAgent,
      customerName: name,
      customerPhone: phone,
      walletUsed: walletUsed,
      pointsEarned: pointsEarned
    };

    // 1. Deduct Wallet Balance Used
    if (walletUsed > 0) {
        await updateWallet(-walletUsed);
    }

    // 2. Credit Points (Immediate gratification per requirement)
    await updateWallet(pointsEarned);

    // 3. Save Order (Non-blocking)
    setDoc(doc(db, 'orders', newOrderId), newOrderData).catch(error => {
        console.error("Create order background error", error);
        addToast("Order placed locally but sync failed. Check connection.", "info");
    });

    // 4. Send SMS Notifications (Simulation)
    const itemsSummary = items.map(i => `${i.quantity}x ${i.name.en}`).join(', ');
    
    // To User
    const userMsg = `Hi ${name}, Order ${newOrderId} confirmed! Shipping to ${address}. Total: ₹${billDetails.grandTotal}. Points Earned: ${pointsEarned}. Track on App.`;
    sendSMS(phone, userMsg);
    
    // To Owner
    const ownerMsg = `NEW ORDER: ${newOrderId} | Amt: ₹${billDetails.grandTotal} | ${paymentMethod} | User: ${name} (${phone}) | Items: ${itemsSummary} | Loc: ${address}`;
    sendSMS(OWNER_PHONE, ownerMsg);

    return newOrderId;
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
        const order = orders.find(o => o.id === orderId);
        if (!order) return false;

        // Check if within 2 minutes
        const elapsed = Date.now() - order.createdAt;
        if (elapsed > 2 * 60 * 1000) {
            addToast("Cancellation window closed (2 mins exceeded)", "error");
            return false;
        }

        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: 'Cancelled' });

        // Reverse Financials
        // 1. Refund Wallet Used
        if (order.walletUsed && order.walletUsed > 0) {
            await updateWallet(order.walletUsed);
        }
        // 2. Remove Points Earned
        if (order.pointsEarned && order.pointsEarned > 0) {
            await updateWallet(-order.pointsEarned);
        }
        // 3. If Online Payment was used, trigger refund process (Mock)
        if (order.paymentMethod.toLowerCase().includes('online')) {
            addToast("Online payment refund initiated to source.", "info");
        }

        addToast("Order cancelled & refund processed to wallet.", "success");
        return true;
    } catch (error) {
        console.error("Cancel order error", error);
        addToast("Failed to cancel order", "error");
        return false;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(46, 125, 50); // Leaf Green
    doc.text("FreshLeaf", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("123 Green Market, Sector 4, New Delhi - 110001", 14, 26);
    doc.text(`Invoice #: INV-${order.id}`, 14, 32);
    doc.text(`Date: ${order.date}`, 14, 36);

    // Customer Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Bill To:", 14, 48);
    doc.setFontSize(10);
    doc.text(`${order.customerName}`, 14, 54);
    doc.text(`${order.address}`, 14, 58);
    doc.text(`Phone: ${order.customerPhone}`, 14, 62);

    // Items Table
    const tableBody = order.items.map(item => [
        item.name.en,
        item.quantity,
        `Rs. ${item.price}`,
        `Rs. ${item.price * item.quantity}`
    ]);

    autoTable(doc, {
        startY: 70,
        head: [['Item', 'Qty', 'Unit Price', 'Total']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text(`Subtotal: Rs. ${order.total}`, 140, finalY);
    if (order.walletUsed && order.walletUsed > 0) {
        doc.text(`Wallet Used: - Rs. ${order.walletUsed}`, 140, finalY + 6);
    }
    const payMethod = order.paymentMethod.includes('Online') ? 'Online' : 'Cash';
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Paid (${payMethod}): Rs. ${Math.max(0, order.total - (order.walletUsed || 0))}`, 140, finalY + 14);

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for shopping fresh!", 14, finalY + 30);
    doc.text("For support call +91 98765 43210", 14, finalY + 34);

    doc.save(`FreshLeaf_Invoice_${order.id}.pdf`);
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
