
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, AlertTriangle, X, Lock } from 'lucide-react';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';

export const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { getProductImage } = useImage();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState<{id: string, unit: string, name: string} | null>(null);

  const MIN_ORDER_VALUE = 100;
  const FREE_DELIVERY_THRESHOLD = 200;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const initiateRemove = (id: string, unit: string, name: string) => {
    setConfirmRemove({ id, unit, name });
  };

  const confirmRemoval = () => {
    if (confirmRemove) {
      removeFromCart(confirmRemove.id, confirmRemove.unit);
      setConfirmRemove(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-full shadow-lg mb-6 animate-in zoom-in duration-300">
          <ShoppingBag size={64} className="text-leaf-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-lg">Fresh vegetables are waiting for you!</p>
        <Link to="/shop" className="bg-leaf-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-leaf-700 transition shadow-lg shadow-leaf-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen relative">
      
      {/* Custom Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 relative">
            <button 
              onClick={() => setConfirmRemove(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-4">
               <div className="bg-red-50 p-4 rounded-full">
                 <AlertTriangle size={32} className="text-red-500" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Remove Item?</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">
              Are you sure you want to remove <br/><span className="font-bold text-gray-800">{confirmRemove.name}</span> from your cart?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmRemove(null)} 
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoval} 
                className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-200"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
           <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
           <span className="bg-leaf-100 text-leaf-700 font-bold px-3 py-1 rounded-full text-sm">{cartItems.length} items</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wide">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedUnit}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-4 md:p-6 items-center hover:bg-gray-50/50 transition">
                    
                    {/* Mobile: Product Info & Image */}
                    <div className="col-span-1 md:col-span-6 flex items-start md:items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 p-1 flex-shrink-0 border border-gray-100">
                         <img src={getProductImage(item.id, item.image)} alt={item.name.en} className="w-full h-full object-cover rounded-lg mix-blend-multiply" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg">{item.name.en}</h3>
                        <p className="text-sm text-gray-500 mb-1 font-hindi">{item.name.hi}</p>
                        <span className="inline-block bg-white border border-gray-200 text-gray-600 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded">
                          {item.selectedUnit}
                        </span>
                        {/* Mobile Price display inline */}
                        <div className="md:hidden mt-2 font-bold text-leaf-700">
                            {formatPrice(item.price)} <span className="text-xs text-gray-400 font-normal">/ unit</span>
                        </div>
                      </div>
                      {/* Mobile Remove Button (Top Right) */}
                      <button 
                            onClick={() => initiateRemove(item.id, item.selectedUnit, item.name.en)} 
                            className="md:hidden text-gray-400 hover:text-red-500 p-2 rounded-full transition"
                            title="Remove Item"
                         >
                            <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Desktop Price */}
                    <div className="hidden md:block col-span-1 md:col-span-2 text-gray-700 font-medium text-center">
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity Controls (Responsive) */}
                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                      <span className="md:hidden text-sm font-bold text-gray-500 uppercase">Quantity:</span>
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                        <button onClick={() => updateQuantity(item.id, item.selectedUnit, item.quantity - 1)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg"><Minus size={14} /></button>
                        <span className="px-3 text-sm font-bold text-gray-800 w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedUnit, item.quantity + 1)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg"><Plus size={14} /></button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="col-span-1 md:col-span-2 flex justify-between md:block text-right mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-50">
                       <span className="md:hidden font-bold text-gray-500">Subtotal:</span>
                       <div className="flex items-center justify-end gap-4">
                         <span className="font-bold text-gray-900 text-lg">{formatPrice(item.price * item.quantity)}</span>
                         {/* Desktop Remove Button */}
                         <button 
                            onClick={() => initiateRemove(item.id, item.selectedUnit, item.name.en)} 
                            className="hidden md:block text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition"
                            title="Remove Item"
                         >
                            <Trash2 size={18} />
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-6 text-gray-500 font-bold hover:text-leaf-600 transition">
              <ArrowLeft size={18} /> Continue Shopping
            </Link>
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
              
              {/* Progress for Free Delivery */}
              {cartTotal < FREE_DELIVERY_THRESHOLD && (
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <p className="text-sm text-blue-700 font-medium mb-2">
                     Add <b>{formatPrice(FREE_DELIVERY_THRESHOLD - cartTotal)}</b> more for Free Delivery
                   </p>
                   <div className="w-full bg-blue-200 rounded-full h-1.5">
                     <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${(cartTotal / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                     ></div>
                   </div>
                </div>
              )}

              {/* Progress for Minimum Order */}
              {cartTotal < MIN_ORDER_VALUE && (
                <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 items-start">
                   <AlertTriangle className="text-red-500 shrink-0" size={20} />
                   <p className="text-sm text-red-700 font-medium">
                     Minimum order value is <b>{formatPrice(MIN_ORDER_VALUE)}</b>. Please add more items.
                   </p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Estimate</span>
                  {cartTotal >= FREE_DELIVERY_THRESHOLD ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span className="text-gray-900 font-bold">₹40</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="text-gray-400 text-sm">Calculated at checkout</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-extrabold text-2xl text-leaf-700">{formatPrice(cartTotal + (cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 40))}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                disabled={cartTotal < MIN_ORDER_VALUE}
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-leaf-200 mb-4 text-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {cartTotal < MIN_ORDER_VALUE ? <><Lock size={18}/> Order Min {formatPrice(MIN_ORDER_VALUE)}</> : 'Proceed to Checkout'}
              </button>
              
              <div className="text-xs text-center text-gray-400 flex flex-col gap-2">
                <p>🔒 Secure Checkout powered by Razorpay</p>
                <p>100% Satisfaction Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
