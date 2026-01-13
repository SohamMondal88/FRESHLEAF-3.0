
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Package, Calendar, Download, MessageCircle, ArrowRight, Gift, MapPin, Phone, CreditCard, ShoppingBag } from 'lucide-react';
import { useOrder } from '../services/OrderContext';
import { useImage } from '../services/ImageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order } from '../types';

export const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const { getOrderById, generateInvoice } = useOrder();
  const { getProductImage } = useImage();
  const navigate = useNavigate();

  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try context first, then fetch if missing (for deep links/refresh)
  const contextOrder = getOrderById(orderId || '');

  useEffect(() => {
    if (!orderId) {
       navigate('/'); 
       return;
    }

    if (contextOrder) {
        setFetchedOrder(contextOrder);
        setIsLoading(false);
    } else {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', orderId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setFetchedOrder({ id: snap.id, ...snap.data() } as Order);
                }
            } catch (e) {
                console.error("Failed to fetch order", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }
  }, [orderId, contextOrder, navigate]);

  const order = fetchedOrder;

  if (isLoading || !order) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your order details...</p>
        </div>
      );
  }

  // Pre-fill WhatsApp message for the user to send to the owner
  const handleWhatsAppShare = () => {
    // Owner phone number (replace with real one)
    const ownerPhone = "916297179823"; 
    const message = `Hi FreshLeaf, I just placed an order! \n\nOrder ID: ${order.id} \nName: ${order.customerName} \nAmount: ₹${order.total} \n\nPlease confirm delivery time.`;
    const url = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="py-12 bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Status */}
        <div className="text-center mb-10 animate-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 text-lg">Thank you for shopping with FreshLeaf.</p>
            <div className="mt-4 inline-block bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm text-sm font-bold text-gray-700">
                Order ID: {order.id}
            </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* Left Column: Order Details */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Items List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-leaf-600"/> Items Ordered
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 p-1 border border-gray-100">
                                    <img 
                                        src={getProductImage(item.id, item.image)} 
                                        alt={item.name.en} 
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 text-sm">{item.name.en}</h4>
                                    <p className="text-xs text-gray-500">{item.selectedUnit} • ₹{item.price} each</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 text-gray-500 uppercase tracking-wide">
                            <MapPin size={14}/> Shipping Address
                        </h3>
                        <p className="text-gray-800 font-bold text-sm leading-relaxed">{order.customerName}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{order.address}</p>
                        <p className="text-gray-600 text-sm mt-1 flex items-center gap-1"><Phone size={12}/> {order.customerPhone}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2 text-gray-500 uppercase tracking-wide">
                            <CreditCard size={14}/> Payment Info
                        </h3>
                        <p className="text-gray-800 font-bold text-sm">{order.paymentMethod}</p>
                        <p className="text-gray-600 text-sm mt-1">Status: <span className="text-green-600 font-bold">Paid / Confirmed</span></p>
                    </div>
                </div>

                {/* Tracking Steps */}
                <div className="bg-leaf-50 rounded-3xl p-6 border border-leaf-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm"><Package className="text-leaf-600" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Order Packed</h4>
                                <p className="text-xs text-gray-500">Warehouse processing</p>
                            </div>
                        </div>
                        <div className="hidden sm:block w-12 h-0.5 bg-leaf-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm"><Truck className="text-blue-600" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Dispatch</h4>
                                <p className="text-xs text-gray-500">Bombax Logistics</p>
                            </div>
                        </div>
                        <div className="hidden sm:block w-12 h-0.5 bg-leaf-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm"><Calendar className="text-orange-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Delivery</h4>
                                <p className="text-xs text-gray-500">Tomorrow, 2 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Summary & Actions */}
            <div className="space-y-6">
                
                {/* Payment Summary */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-extrabold text-gray-900 text-lg mb-4">Payment Summary</h3>
                    
                    <div className="space-y-3 text-sm pb-4 border-b border-dashed border-gray-200">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Delivery Fee</span>
                            <span>FREE</span>
                        </div>
                        {order.walletUsed && order.walletUsed > 0 && (
                            <div className="flex justify-between text-leaf-600">
                                <span>Wallet Used</span>
                                <span>- {formatPrice(order.walletUsed)}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 mb-6">
                        <span className="font-bold text-gray-900 text-lg">Grand Total</span>
                        <span className="font-extrabold text-leaf-700 text-2xl">{formatPrice(order.total - (order.walletUsed || 0))}</span>
                    </div>

                    {order.pointsEarned && order.pointsEarned > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-center gap-2 mb-6">
                            <Gift className="text-yellow-600" size={18}/>
                            <span className="font-bold text-yellow-800 text-sm">You earned {order.pointsEarned} Points!</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            onClick={() => generateInvoice(order)}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition text-sm"
                        >
                            <Download size={16} /> Download Invoice
                        </button>
                        <button 
                            onClick={handleWhatsAppShare}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition text-sm"
                        >
                            <MessageCircle size={16} /> Send to Owner (WhatsApp)
                        </button>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    <Link to={`/track-order/${order.id}`} className="bg-gray-900 text-white py-4 rounded-2xl font-bold text-center hover:bg-leaf-600 transition shadow-lg flex items-center justify-center gap-2 group">
                        Track Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                    </Link>
                    <Link to="/shop" className="bg-white border-2 border-gray-100 text-gray-600 py-3 rounded-2xl font-bold text-center hover:border-leaf-200 hover:text-leaf-600 transition">
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
