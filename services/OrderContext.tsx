
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem, DeliveryAgent } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

// Declare jsPDF types for the window object
declare global {
  interface Window {
    jspdf: any;
  }
}

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => Promise<boolean>;
  getOrderById: (id: string) => Order | undefined;
  generateInvoice: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Define your 3 friends as delivery agents
const MY_AGENTS: DeliveryAgent[] = [
  {
    name: "Rohan Das",
    phone: "+91 98765 11111",
    vehicleNumber: "WB-02-AB-1234",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.9
  },
  {
    name: "Vikram Singh",
    phone: "+91 98765 22222",
    vehicleNumber: "WB-04-XY-5678",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4.8
  },
  {
    name: "Amit Verma",
    phone: "+91 98765 33333",
    vehicleNumber: "WB-06-ZZ-9012",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 5.0
  }
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from local storage
  useEffect(() => {
    const storedOrders = localStorage.getItem('freshleaf_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  // Save orders whenever they change
  useEffect(() => {
    if (orders.length > 0) {
        localStorage.setItem('freshleaf_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const generateInvoice = (order: Order) => {
    if (!window.jspdf) {
      console.error("jsPDF library not loaded");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(76, 175, 80); // Green color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FreshLeaf', 14, 25);
    doc.setFontSize(12);
    doc.text('Invoice & Receipt', 160, 25);

    // Order Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id}`, 14, 50);
    doc.text(`Date: ${order.date}`, 14, 55);
    doc.text(`Status: ${order.status}`, 14, 60);
    doc.text(`Courier: FreshLeaf Courier`, 14, 65);
    if(order.agent) {
        doc.text(`Agent: ${order.agent.name} (${order.agent.phone})`, 14, 70);
    }

    // Customer Details
    doc.text(`Billed To:`, 140, 50);
    doc.text(`${order.customerName || 'Customer'}`, 140, 55);
    doc.text(`${order.customerPhone || ''}`, 140, 60);
    const splitAddress = doc.splitTextToSize(order.address, 60);
    doc.text(splitAddress, 140, 65);

    // Items Table
    const tableColumn = ["Item", "Qty", "Unit", "Price", "Total"];
    const tableRows: any[] = [];

    order.items.forEach(item => {
      const itemData = [
        item.name.en,
        item.quantity,
        item.selectedUnit,
        `Rs. ${item.price}`,
        `Rs. ${item.price * item.quantity}`
      ];
      tableRows.push(itemData);
    });

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 9 }
    });

    // Total
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: Rs. ${order.total}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for shopping with FreshLeaf.', 105, 280, { align: 'center' });
    
    // Save
    doc.save(`FreshLeaf_Invoice_${order.id}.pdf`);
  };

  const createOrder = async (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string) => {
    // Simulate processing delay removed for speed
    
    const orderId = 'FL-' + Math.floor(100000 + Math.random() * 900000);
    const trackingId = 'FLC-' + Math.random().toString(36).substr(2, 9).toUpperCase(); 
    
    // Randomly assign one of your friends
    const assignedAgent = MY_AGENTS[Math.floor(Math.random() * MY_AGENTS.length)];

    const newOrder: Order = {
      id: orderId,
      userId: user?.id || 'guest',
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
      createdAt: Date.now(),
      total,
      status: 'Processing',
      items,
      paymentMethod,
      address,
      trackingId,
      courier: 'FreshLeaf Courier',
      agent: assignedAgent,
      customerName: name,
      customerPhone: phone
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const cancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    // Check if within 2 minutes (120000 ms)
    const timeElapsed = Date.now() - order.createdAt;
    if (timeElapsed > 2 * 60 * 1000) {
        addToast("Cancellation window (2 mins) has expired.", "error");
        return false;
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
        return false;
    }

    updateOrderStatus(orderId, 'Cancelled');
    addToast("Order cancelled successfully. Refund initiated.", "success");
    return true;
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const userOrders = user ? orders.filter(o => o.userId === user.id) : [];

  return (
    <OrderContext.Provider value={{ orders: userOrders, createOrder, updateOrderStatus, cancelOrder, getOrderById, generateInvoice }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
