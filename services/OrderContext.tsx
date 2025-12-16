import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem } from '../types';
import { useAuth } from './AuthContext';

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
  getOrderById: (id: string) => Order | undefined;
  generateInvoice: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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
    doc.text(`Courier: ${order.courier || 'Standard'}`, 14, 65);

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
    doc.text('Thank you for shopping with FreshLeaf. Delivered by Bombax Logistics.', 105, 280, { align: 'center' });
    
    // Save
    doc.save(`FreshLeaf_Invoice_${order.id}.pdf`);
  };

  const createOrder = async (items: CartItem[], total: number, address: string, paymentMethod: string, phone: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
    
    const orderId = 'FL-' + Math.floor(100000 + Math.random() * 900000);
    const trackingId = 'BMX-' + Math.random().toString(36).substr(2, 9).toUpperCase(); // BMX prefix for Bombax
    
    const newOrder: Order = {
      id: orderId,
      userId: user?.id || 'guest',
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
      total,
      status: 'Processing',
      items,
      paymentMethod,
      address,
      trackingId,
      courier: 'Bombax',
      customerName: name,
      customerPhone: phone
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    // localStorage set handled by useEffect
    
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getOrderById = (id: string) => {
    return orders.find(o => o.id === id);
  };

  const userOrders = user ? orders.filter(o => o.userId === user.id) : [];

  return (
    <OrderContext.Provider value={{ orders: userOrders, createOrder, updateOrderStatus, getOrderById, generateInvoice }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};