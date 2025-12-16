import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useOrder } from '../services/OrderContext';
import { useAuth } from '../services/AuthContext';
import { useImage } from '../services/ImageContext';

export const Orders: React.FC = () => {
  const { orders } = useOrder();
  const { user } = useAuth();
  const { getProductImage } = useImage();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <Link to="/shop" className="text-leaf-600 font-semibold hover:underline">Shop Now</Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link to="/shop" className="bg-leaf-600 text-white px-6 py-2 rounded-lg font-bold">Go to Shop</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-leaf-300 transition">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">Order Placed</span>
                    <p className="text-gray-900 font-medium">{order.date}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">Total</span>
                    <p className="text-gray-900 font-medium">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">Order #</span>
                    <p className="text-gray-900 font-medium">{order.id}</p>
                  </div>
                  <div className="sm:ml-auto">
                     <Link to={`/track-order/${order.id}`} className="bg-leaf-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-leaf-700 transition flex items-center gap-2">
                       Track Order <ChevronRight size={16} />
                     </Link>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {order.status === 'Delivered' ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : order.status === 'Cancelled' ? (
                      <XCircle className="text-red-500" size={20} />
                    ) : (
                      <Clock className="text-orange-500" size={20} />
                    )}
                    <span className={`font-bold ${order.status === 'Delivered' ? 'text-green-600' : order.status === 'Cancelled' ? 'text-red-500' : 'text-orange-500'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-grow space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img src={getProductImage(item.id, item.image)} alt={item.name.en} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name.en}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};