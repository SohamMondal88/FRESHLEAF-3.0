import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, Check, Clock, Home, ArrowLeft, Star, MapPin, Truck } from 'lucide-react';
import { useOrder } from '../services/OrderContext';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrder();
  const order = getOrderById(id || '');
  const [progress, setProgress] = useState(0);

  // Simulated live progress based on order state (visual only for demo)
  useEffect(() => {
    if (!order) return;
    
    // Simulate progress moving
    const timer = setInterval(() => {
      setProgress(old => {
        // Stop at specific percentages based on status
        const max = order.status === 'Delivered' ? 100 : 
                    order.status === 'Out for Delivery' ? 80 :
                    order.status === 'Packed' ? 40 : 10;
        
        return old < max ? old + 1 : old;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [order]);

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Order Not Found</h2>
      <Link to="/orders" className="text-leaf-600 hover:underline">Back to Orders</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-50 flex items-center gap-4">
        <Link to="/orders" className="text-gray-600 hover:text-gray-900"><ArrowLeft /></Link>
        <div>
          <h1 className="font-bold text-lg">Tracking {order.trackingId || order.id}</h1>
          <p className="text-xs text-gray-500">{order.date} • {order.items.length} items</p>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-2xl">
        {/* Map Section */}
        <div className="bg-gray-200 w-full h-72 rounded-xl mb-4 relative overflow-hidden group border border-gray-300">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-[#e5e7eb]" style={{ 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/city-fields.png")', 
            backgroundSize: '400px' 
          }}></div>
          
          {/* Path Line */}
          <div className="absolute top-1/2 left-12 right-12 h-2 bg-gray-300/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Icons */}
          <div className="absolute top-1/2 left-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg border border-gray-200 z-10">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          {order.status !== 'Processing' && order.status !== 'Packed' && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-xl border border-gray-200 transition-all duration-300 z-20 flex flex-col items-center"
              style={{ left: `calc(8% + ${progress * 0.8}%)` }}
            >
              <span className="text-2xl animate-bounce">🛵</span>
            </div>
          )}

          <div className="absolute top-1/2 right-10 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg border border-gray-200 z-10">
            <Home size={20} className="text-leaf-600" />
          </div>

          {/* Bombax Badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-100 flex items-center gap-2">
             <Truck size={14} className="text-blue-600" />
             <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Courier Partner</p>
                <p className="text-xs font-bold text-gray-900">Bombax Logistics</p>
             </div>
          </div>

          {/* ETA Badge */}
          {order.status !== 'Delivered' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <Clock size={16} className="text-green-400" />
              {order.status === 'Processing' ? 'Preparing Order' : 'Arriving Soon'}
            </div>
          )}
        </div>

        {/* Live Status Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {order.status === 'Delivered' ? 'Order Delivered' : order.status === 'Out for Delivery' ? 'On the way' : 'Preparing your order'}
          </h2>
          <p className="text-gray-500 mb-6">
            {order.status === 'Delivered' ? 'Enjoy your fresh produce!' : 'Our delivery partner is riding responsibly.'}
          </p>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Partner" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
            <div className="flex-grow">
              <h4 className="font-bold text-gray-900">Amit Verma</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="bg-yellow-100 text-yellow-700 px-1 rounded flex items-center gap-0.5"><Star size={10} fill="currentColor"/> 4.9</span>
                <span>• Bombax Courier</span>
              </div>
            </div>
            <button className="bg-white border border-gray-200 p-3 rounded-full text-green-600 hover:bg-green-50 shadow-sm transition">
              <Phone size={20} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Tracking History</h3>
          <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
            {[
              { title: 'Order Placed', time: order.date, active: true },
              { title: 'Packed at Warehouse', time: 'Items secured safely', active: ['Packed', 'Out for Delivery', 'Delivered'].includes(order.status) },
              { title: 'Picked up by Bombax', time: 'Courier partner has received package', active: ['Out for Delivery', 'Delivered'].includes(order.status) },
              { title: 'Out for Delivery', time: 'Rider is on the way to your address', active: ['Out for Delivery', 'Delivered'].includes(order.status) },
              { title: 'Delivered', time: 'Handed over to you', active: order.status === 'Delivered' }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-6">
                <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 transition-colors duration-500 ${step.active ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                  {step.active && <Check size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                </div>
                <h4 className={`text-sm font-bold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                <p className="text-xs text-gray-500">{step.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin size={18} className="mt-0.5 text-leaf-600 shrink-0" />
            <p>{order.address}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-sm mb-2">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity} x {item.name.en}</span>
                  <span>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
