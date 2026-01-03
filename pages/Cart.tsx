
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, ShoppingBag, Bike, Home, Info, ArrowRight } from 'lucide-react';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';

export const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, bill, setTip, tip } = useCart();
  const { getProductImage } = useImage();
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <Link to="/shop" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-sm">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f6fb] min-h-screen pb-32 font-sans">
      <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center gap-3">
         <button onClick={() => navigate(-1)}><ArrowLeft size={20} className="text-gray-600"/></button>
         <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Your Cart</h1>
            <p className="text-xs text-gray-500">{cartItems.length} items</p>
         </div>
      </div>

      <div className="container mx-auto max-w-lg p-4 space-y-4">
        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedUnit}`} className="flex gap-3 p-4 border-b border-gray-50 last:border-0">
                    <div className="w-16 h-16 rounded-lg border border-gray-100 p-1 flex-shrink-0 relative">
                        <img src={getProductImage(item.id, item.image)} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name.en}</h4>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</span>
                            <div className="flex items-center bg-green-50 border border-green-600 rounded-lg h-8">
                                <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.selectedUnit, item.quantity - 1) : removeFromCart(item.id, item.selectedUnit)} className="px-2 text-green-700 hover:bg-green-100 rounded-l-lg h-full flex items-center"><Minus size={12}/></button>
                                <span className="px-2 text-xs font-bold text-green-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.selectedUnit, item.quantity + 1)} className="px-2 text-green-700 hover:bg-green-100 rounded-r-lg h-full flex items-center"><Plus size={12}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Tip Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1">Tip your delivery partner <span className="text-lg">💖</span></h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3">
                {[10, 20, 30, 50].map(amt => (
                    <button 
                        key={amt} 
                        onClick={() => setTip(tip === amt ? 0 : amt)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${tip === amt ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        ₹{amt}
                    </button>
                ))}
            </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2 text-sm">
            <h3 className="font-bold text-gray-900 mb-3">Bill Details</h3>
            
            <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><ShoppingBag size={12}/> MRP Total</span>
                <span>{formatPrice(bill.itemTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><Bike size={12}/> Delivery Fee</span>
                {bill.deliveryFee === 0 ? <span className="text-green-600">FREE</span> : <span>{formatPrice(bill.deliveryFee)}</span>}
            </div>
            <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><Info size={12}/> Handling Charge</span>
                <span>{formatPrice(bill.handlingFee)}</span>
            </div>
            {bill.smallCartFee > 0 && (
                <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">Small Cart Fee</span>
                    <span>{formatPrice(bill.smallCartFee)}</span>
                </div>
            )}
            {tip > 0 && (
                <div className="flex justify-between text-yellow-600 font-medium">
                    <span>Delivery Tip</span>
                    <span>{formatPrice(tip)}</span>
                </div>
            )}
            <div className="border-t border-dashed border-gray-200 pt-3 mt-2 flex justify-between items-center">
                <span className="font-extrabold text-gray-900 text-base">Grand Total</span>
                <span className="font-extrabold text-gray-900 text-base">{formatPrice(bill.finalTotal)}</span>
            </div>
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl z-50">
            <div className="container mx-auto max-w-lg">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg text-gray-900">{formatPrice(bill.finalTotal)}</span>
                        <span className="text-xs text-blue-600 font-bold uppercase cursor-pointer">View Detailed Bill</span>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="flex-grow bg-green-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                    >
                        Click to Pay <ArrowRight size={18}/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
