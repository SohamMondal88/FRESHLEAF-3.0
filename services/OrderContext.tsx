
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BillDetails, Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from './ToastContext';
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
      deliverySlot: { date: string; time: string } | null,
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

// Replace with the actual Owner Phone Number
const OWNER_PHONE = "916297179823"; 

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

  const createOrder = async (
      items: CartItem[], 
      billDetails: BillDetails, 
      address: string, 
      paymentMethod: string, 
      phone: string, 
      name: string, 
      deliverySlot: { date: string; time: string } | null,
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
      paymentMethod,
      address,
      instructions: finalInstructions,
      deliverySlot: deliverySlot || undefined,
      deliveryNotes: customInstruction || undefined,
      trackingId: 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      courier: 'FreshLeaf Courier',
      agent: assignedAgent,
      customerName: name,
      customerPhone: phone,
      walletUsed: walletUsed,
      pointsEarned: pointsEarned
    };

    // 1. Deduct Wallet Balance Used (Immediate local update)
    if (walletUsed > 0) {
        updateWallet(-walletUsed);
    }

    // 2. Credit Points (Immediate local update)
    updateWallet(pointsEarned);

    // 3. Save Order (Non-blocking / Background)
    setDoc(doc(db, 'orders', newOrderId), newOrderData)
      .then(() => console.log("Order synced to Firebase"))
      .catch(error => {
        console.error("Create order background error", error);
        addToast("Order placed locally. Syncing...", "info");
    });

    // 4. Log for "Server-Side" Notification Simulation
    console.log(`%c[SMS SENT to ${phone}] Order ${newOrderId} Confirmed!`, "color: green; font-weight: bold;");
    console.log(`%c[WHATSAPP SENT to OWNER] New Order: ${newOrderId} | ₹${billDetails.grandTotal}`, "color: blue; font-weight: bold;");

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

        const elapsed = Date.now() - order.createdAt;
        if (elapsed > 2 * 60 * 1000) {
            addToast("Cancellation window closed (2 mins exceeded)", "error");
            return false;
        }

        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: 'Cancelled' });

        if (order.walletUsed && order.walletUsed > 0) {
            updateWallet(order.walletUsed);
        }
        if (order.pointsEarned && order.pointsEarned > 0) {
            updateWallet(-order.pointsEarned);
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

    // Brand Header
    doc.setFillColor(76, 175, 80); // FreshLeaf Green
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FreshLeaf", 14, 13);
    doc.setFontSize(10);
    doc.text("Organic Farm to Table", 160, 13);

    // Invoice Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 40);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${order.id}`, 14, 48);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 53);
    doc.text(`Status: ${order.paymentMethod.includes('Online') ? 'Paid' : 'Payment Pending'}`, 14, 58);

    // From / To
    doc.text("From:", 14, 70);
    doc.setFont("helvetica", "bold");
    doc.text("FreshLeaf Organics Pvt Ltd", 14, 75);
    doc.setFont("helvetica", "normal");
    doc.text("123 Green Market, Sector 4", 14, 80);
    doc.text("New Delhi - 110001", 14, 85);
    doc.text(`Phone: ${OWNER_PHONE}`, 14, 90);

    doc.text("Bill To:", 120, 70);
    doc.setFont("helvetica", "bold");
    doc.text(order.customerName || "Valued Customer", 120, 75);
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(order.address, 70);
    doc.text(addressLines, 120, 80);
    doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 120, 80 + (addressLines.length * 5));

    // Items Table
    const tableBody = order.items.map(item => [
        item.name.en,
        item.quantity + ' ' + item.selectedUnit.replace(/[0-9]/g, ''), // Rough unit fix if needed
        item.selectedUnit,
        `Rs. ${item.price}`,
        `Rs. ${item.price * item.quantity}`
    ]);

    autoTable(doc, {
        startY: 110,
        head: [['Item Name', 'Qty', 'Unit', 'Price', 'Amount']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        styles: { fontSize: 9 },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`Rs. ${order.total + (order.walletUsed || 0)}`, 180, finalY, { align: 'right' });
    
    if (order.walletUsed && order.walletUsed > 0) {
        doc.text(`Wallet Used:`, 140, finalY + 6);
        doc.text(`- Rs. ${order.walletUsed}`, 180, finalY + 6, { align: 'right' });
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total:`, 140, finalY + 14);
    doc.text(`Rs. ${order.total}`, 180, finalY + 14, { align: 'right' });

    // Footer
    doc.setDrawColor(200);
    doc.line(14, 270, 196, 270);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Thank you for choosing FreshLeaf! Eating fresh is eating healthy.", 105, 275, { align: 'center' });
    doc.text("For support, visit our website or contact us.", 105, 280, { align: 'center' });

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
