
import React, { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, Package, Calendar, Download, MessageCircle, ArrowRight, Gift } from 'lucide-react';
import { useOrder } from '../services/OrderContext';

export const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const { getOrderById, generateInvoice } = useOrder();
  const navigate = useNavigate();

  const order = getOrderById(orderId || '');

  useEffect(() => {
    if (!orderId) {
       // navigate('/');
    }
  }, [orderId, navigate]);

  if (!order) {
      return <div className="min-h-screen flex items-center justify-center">Loading order details...</div>
  }

  const handleWhatsAppShare = () => {
    const message = `Hi FreshLeaf, I just placed an order with ID: ${order.id}. Can you please confirm the delivery time?`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100 relative overflow-hidden">
        {/* Confetti Background effect (simplified) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-leaf-400 via-yellow-400 to-leaf-600"></div>

        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            <CheckCircle size={64} className="text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-4">Thank you for shopping with FreshLeaf.</p>
        <p className="text-lg font-bold text-gray-800 bg-gray-50 inline-block px-4 py-2 rounded-lg mb-6 border border-gray-200">
           Order ID: {order.id}
        </p>

        {order.pointsEarned && order.pointsEarned > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center justify-center gap-3 animate-pulse">
                <Gift className="text-yellow-600" size={24}/>
                <span className="font-bold text-yellow-800 text-lg">You earned {order.pointsEarned} Points!</span>
            </div>
        )}
        
        {/* Feature Section (Order Steps) */}
        <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"><Package className="text-leaf-600" size={20} /></div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm">Order Packed</h4>
               <p className="text-xs text-gray-500">Processing at Warehouse</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"><Truck className="text-blue-600" size={20} /></div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm">Shipped via Bombax</h4>
               <p className="text-xs text-gray-500">Fast Kolkata Delivery Partner</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"><Calendar className="text-leaf-600" size={20} /></div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm">Estimated Delivery</h4>
               <p className="text-xs text-gray-500">Tomorrow by 2:00 PM</p>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 mb-8">
            <button 
                onClick={() => generateInvoice(order)}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
            >
                <Download size={18} /> Download Invoice PDF
            </button>
            <button 
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition"
            >
                <MessageCircle size={18} /> Get Updates on WhatsApp
            </button>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-100 pt-6">
          <Link to={`/track-order/${order.id}`} className="text-leaf-600 font-bold hover:underline py-2 flex items-center justify-center gap-1">
             Track Order <ArrowRight size={16}/>
          </Link>
          <Link to="/shop" className="text-gray-500 font-medium hover:text-gray-800 py-2">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};
