
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Phone, Check, Home, ArrowLeft, MapPin, Truck, X } from 'lucide-react';
import { useOrder } from '../services/OrderContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order } from '../types';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById, cancelOrder } = useOrder();
  const navigate = useNavigate();
  const contextOrder = getOrderById(id || '');
  const [order, setOrder] = useState<Order | null>(contextOrder || null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [progress, setProgress] = useState(0);
  const [canCancel, setCanCancel] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dynamicEta, setDynamicEta] = useState(25);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    if (contextOrder) {
      setOrder(contextOrder);
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() } as Order);
        }
      } catch (error) {
        console.error("Failed to fetch order fallback", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [contextOrder, id]);

  // Cancellation Timer Logic (2 Minutes)
  useEffect(() => {
    if (!order) return;

    const checkCancellation = () => {
        const elapsed = Date.now() - order.createdAt;
        const totalDuration = 2 * 60 * 1000;
        const remaining = totalDuration - elapsed;
        
        if (remaining > 0 && order.status !== 'Cancelled' && order.status !== 'Delivered') {
            setCanCancel(true);
            setTimeLeft(Math.floor(remaining / 1000));
        } else {
            setCanCancel(false);
            setTimeLeft(0);
        }
    };

    checkCancellation();
    const timer = setInterval(checkCancellation, 1000);
    return () => clearInterval(timer);
  }, [order]);

  // Simulate Live Map Movement & ETA
  useEffect(() => {
    if (!order || order.status === 'Cancelled') {
        setProgress(0);
        return;
    }
    
    const timer = setInterval(() => {
      setProgress(old => {
        const max = order.status === 'Delivered' ? 100 : 
                    order.status === 'Out for Delivery' ? 85 :
                    order.status === 'Packed' ? 35 : 10;
        
        const newProgress = old < max ? old + 0.5 : old;
        
        // Update ETA based on progress (Simple simulation)
        if (order.status === 'Out for Delivery') {
            const simulatedMinsLeft = Math.ceil((100 - newProgress) * 0.4); 
            setDynamicEta(Math.max(1, simulatedMinsLeft));
        }
        
        return newProgress;
      });
    }, 100); 
    return () => clearInterval(timer);
  }, [order]);

  const handleCancel = async () => {
      if(window.confirm("Are you sure you want to cancel? Refunds are processed instantly to your wallet.")) {
          const success = await cancelOrder(order!.id);
          if (success) {
              navigate('/orders'); // Redirect to orders page on cancel
          }
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-leaf-200 border-t-leaf-600 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Loading order tracking...</p>
      </div>
    );
  }

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Order Not Found</h2>
      <Link to="/orders" className="text-leaf-600 hover:underline">Back to Orders</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-20">
      {/* Navbar */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Link to="/orders" className="text-gray-600 hover:text-gray-900 bg-gray-50 p-2 rounded-full"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="font-extrabold text-lg text-gray-900 leading-none">Tracking Order</h1>
          <p className="text-xs text-gray-500 font-bold mt-0.5">#{order.id}</p>
        </div>
        
        {/* Cancellation Timer */}
        {canCancel && (
            <div className="ml-auto flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Cancel Within</p>
                    <p className="text-xs font-mono font-bold text-red-500">{formatTime(timeLeft)}</p>
                </div>
                <button 
                    onClick={handleCancel}
                    className="text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-full border border-red-100 hover:bg-red-100 transition animate-pulse flex items-center gap-1"
                >
                    <X size={14}/> Cancel
                </button>
            </div>
        )}
      </div>

      <div className="container mx-auto p-4 max-w-xl">
        
        {/* Status Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center border border-gray-100 transition-all duration-500">
            {order.status === 'Cancelled' ? (
                <div className="text-red-500 animate-in zoom-in">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Order Cancelled</h2>
                    <p className="text-gray-500 text-sm mt-1">Refund has been initiated.</p>
                </div>
            ) : order.status === 'Delivered' ? (
                <div className="text-green-600 animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={32} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Order Delivered</h2>
                    <p className="text-gray-500 text-sm mt-1">Enjoy your fresh produce!</p>
                </div>
            ) : (
                <div className="animate-in fade-in">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                        {order.status === 'Out for Delivery' ? `Arriving in ${dynamicEta} mins` : 
                         order.status === 'Packed' ? 'Order Packed' : 'Preparing Order'}
                    </h2>
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        {order.status === 'Out for Delivery' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>}
                        {order.status === 'Out for Delivery' ? 'Your agent is on the way' : 'We are getting things ready'}
                    </p>
                </div>
            )}
        </div>

        {/* Live Map Visualization */}
        {order.status !== 'Cancelled' && (
            <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden mb-6 relative border border-gray-200">
                {/* Map Background */}
                <div className="h-80 w-full bg-[#e5e7eb] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40" style={{ 
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/city-fields.png")', 
                        backgroundSize: '400px' 
                    }}></div>
                    
                    {/* Roads */}
                    <div className="absolute top-1/2 left-0 right-0 h-24 bg-gray-300 transform -translate-y-1/2 rotate-3 border-y-4 border-white"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-yellow-400 transform -translate-y-1/2 rotate-3 z-0 dashed-line"></div>

                    {/* Path Line */}
                    <div className="absolute top-1/2 left-10 right-10 h-2 bg-gray-200 rounded-full z-10 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-leaf-600 to-leaf-400 transition-all duration-300 shadow-[0_0_10px_rgba(76,175,80,0.6)]" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Bike Icon (Moving) */}
                    <div 
                        className="absolute top-1/2 z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `calc(10% + ${progress * 0.8}%)` }}
                    >
                        <div className="bg-white p-2.5 rounded-full shadow-xl border-2 border-leaf-500 relative z-10">
                            <span className="text-2xl transform -scale-x-100 inline-block">🛵</span>
                        </div>
                        {/* Shadow blob */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/20 blur-md rounded-full z-0 transition-transform duration-500 scale-x-110"></div>
                        
                        {order.status === 'Out for Delivery' && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-bounce">
                                {dynamicEta} mins
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                        )}
                    </div>

                    {/* Source Icon */}
                    <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                            <Home size={20} className="text-gray-400" />
                        </div>
                        <p className="absolute top-14 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 bg-white/80 px-2 rounded">Store</p>
                    </div>

                    {/* Destination Icon */}
                    <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white ring-2 ring-leaf-200 transition-colors ${progress >= 95 ? 'bg-green-500' : 'bg-leaf-600 animate-pulse'}`}>
                            <MapPin size={20} className="text-white" />
                        </div>
                        <p className="absolute top-14 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-900 bg-white/80 px-2 rounded">You</p>
                    </div>
                </div>

                {/* Delivery Agent Info */}
                {order.agent && (
                    <div className="bg-white p-5 border-t border-gray-100 flex items-center gap-4">
                        <div className="relative">
                            <img src={order.agent.avatar} alt={order.agent.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                                {order.agent.rating} ★
                            </div>
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{order.agent.name}</h4>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-0.5">FreshLeaf Courier • {order.agent.vehicleNumber}</p>
                        </div>
                        <a href={`tel:${order.agent.phone}`} className="bg-green-50 border border-green-100 p-3 rounded-xl text-green-600 hover:bg-green-100 transition shadow-sm group">
                            <Phone size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                )}
            </div>
        )}

        {/* Order Items & Address */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck size={18} className="text-leaf-600"/> Delivery Details
            </h3>
            
            <div className="flex items-start gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="bg-white p-2 rounded-full text-leaf-600 shadow-sm"><Home size={16} /></div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Delivering To</p>
                    <p className="text-sm font-bold text-gray-800 leading-snug mt-1">{order.address}</p>
                    {order.deliverySlot && (
                        <p className="text-xs text-leaf-700 font-semibold mt-2">
                            Delivery Slot: {order.deliverySlot.date} • {order.deliverySlot.time}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Items in Order</p>
                <div className="space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                                <span className="text-gray-700 font-medium">{item.name.en}</span>
                            </div>
                            <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Bill</span>
                    <span className="font-extrabold text-xl text-leaf-600">₹{order.total}</span>
                </div>
            </div>

            {order.instructions && order.instructions.length > 0 && (
                <div className="mt-6 bg-leaf-50 border border-leaf-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-leaf-700 uppercase tracking-wide mb-2">Delivery Notes</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                        {order.instructions.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <div className="text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">FreshLeaf Promise</p>
            <p className="text-xs text-gray-400 mt-1">If it's not fresh, we take it back.</p>
        </div>
      </div>
    </div>
  );
};
