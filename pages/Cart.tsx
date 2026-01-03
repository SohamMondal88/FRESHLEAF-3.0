
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, ShoppingBag, Bike, Info, ArrowRight, Trash2, ShieldCheck, Gift } from 'lucide-react';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';

export const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, bill, setTip, tip } = useCart();
  const { getProductImage } = useImage();
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const freeDeliveryThreshold = 499;
  const progress = Math.min((bill.itemTotal / freeDeliveryThreshold) * 100, 100);
  const remaining = freeDeliveryThreshold - bill.itemTotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-[#FAFAF9] font-sans">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center max-w-md w-full border border-gray-100 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="block w-full bg-leaf-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-leaf-700 transition shadow-lg shadow-leaf-200">
                Browse Products
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF9] min-h-screen font-sans pb-32">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
         <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={24} className="text-gray-700"/></button>
            <div className="flex-1">
                <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    My Cart <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{cartItems.length} items</span>
                </h1>
            </div>
         </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left: Items List */}
            <div className="w-full lg:w-2/3 space-y-6 animate-in slide-in-from-left-4 duration-500">
                
                {/* Free Delivery Progress */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700">
                            {remaining > 0 ? `Add ₹${remaining} more for Free Delivery` : '🎉 You unlocked Free Delivery!'}
                        </span>
                        <div className="bg-leaf-100 text-leaf-700 p-1.5 rounded-full"><Bike size={16}/></div>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-leaf-400 to-leaf-600 transition-all duration-1000 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {cartItems.map((item, idx) => (
                        <div key={`${item.id}-${item.selectedUnit}`} className="flex gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                            <div className="w-20 h-20 rounded-xl border border-gray-100 bg-white p-1 flex-shrink-0">
                                <img src={getProductImage(item.id, item.image)} className="w-full h-full object-contain mix-blend-multiply" alt={item.name.en} />
                            </div>
                            <div className="flex-grow flex flex-col justify-between py-1">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h4 className="text-base font-bold text-gray-900 line-clamp-1">{item.name.en}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{item.selectedUnit}</p>
                                    </div>
                                    <span className="font-extrabold text-gray-900">₹{item.price * item.quantity}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9">
                                        <button 
                                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.selectedUnit, item.quantity - 1) : removeFromCart(item.id, item.selectedUnit)} 
                                            className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                                        >
                                            {item.quantity === 1 ? <Trash2 size={14} className="text-red-500"/> : <Minus size={14}/>}
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.selectedUnit, item.quantity + 1)} 
                                            className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                                        >
                                            <Plus size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tip Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Gift size={16} className="text-pink-500"/> Tip your delivery partner</h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                        {[10, 20, 30, 50].map(amt => (
                            <button 
                                key={amt} 
                                onClick={() => setTip(tip === amt ? 0 : amt)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                    tip === amt 
                                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {amt === 0 ? 'None' : `₹${amt}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Summary Sticky */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24 space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <h3 className="font-extrabold text-gray-900 mb-6 text-lg">Bill Summary</h3>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span className="font-medium text-gray-900">{formatPrice(bill.itemTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="flex items-center gap-1">Handling Fee <Info size={12} className="text-gray-400"/></span>
                            <span className="font-medium text-gray-900">{formatPrice(bill.handlingFee)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            {bill.deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : <span className="font-medium text-gray-900">{formatPrice(bill.deliveryFee)}</span>}
                        </div>
                        {tip > 0 && (
                            <div className="flex justify-between text-pink-600">
                                <span>Tip Added</span>
                                <span className="font-bold">{formatPrice(tip)}</span>
                            </div>
                        )}
                        <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-center">
                            <span className="font-extrabold text-gray-900 text-lg">To Pay</span>
                            <span className="font-extrabold text-gray-900 text-xl">{formatPrice(bill.finalTotal)}</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-green-50 rounded-xl p-3 flex items-start gap-3">
                        <ShieldCheck size={20} className="text-green-600 mt-0.5 shrink-0"/>
                        <p className="text-xs text-green-800 font-medium leading-relaxed">
                            Safe and secure payments. 100% authentic products sourced directly from farms.
                        </p>
                    </div>

                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg mt-6 hover:bg-leaf-600 transition shadow-xl flex items-center justify-center gap-2 group"
                    >
                        Proceed to Pay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
