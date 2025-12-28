import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useToast } from '../services/ToastContext';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Truck, Tag, X, Wallet, Clock } from 'lucide-react';
import { DeliverySlotPicker } from '../components/DeliverySlotPicker';

export const Checkout: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, updateWallet } = useAuth();
  const { createOrder } = useOrder();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Rules
  const MIN_ORDER_VALUE = 100;
  const FREE_DELIVERY_THRESHOLD = 200;
  const DELIVERY_FEE = 40;

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Wallet State
  const [useWallet, setUseWallet] = useState(false);

  // Delivery Slot
  const [deliverySlot, setDeliverySlot] = useState<{date: string, time: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    address: user?.address || '',
    city: user?.city || 'Kolkata', 
    zip: user?.pincode || '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    if (cartItems.length > 0 && cartTotal < MIN_ORDER_VALUE) {
        addToast(`Minimum order value is ₹${MIN_ORDER_VALUE}`, 'error');
        navigate('/cart');
    }
  }, [cartTotal, cartItems, navigate, addToast]);

  const deliveryCharge = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  
  const maxWalletUsable = user?.walletBalance || 0;
  const payableBeforeWallet = Math.max(0, cartTotal + deliveryCharge - discount);
  const walletUsed = useWallet ? Math.min(maxWalletUsable, payableBeforeWallet) : 0;
  const finalTotal = Math.max(0, payableBeforeWallet - walletUsed);

  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
            <button onClick={() => navigate('/shop')} className="bg-leaf-600 text-white px-6 py-2 rounded-lg font-bold">Go to Shop</button>
        </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    
    if (code === 'FRESH20') {
      setDiscount(Math.round(cartTotal * 0.2));
      setAppliedCoupon('FRESH20');
      addToast('Coupon FRESH20 applied successfully!', 'success');
    } else {
      addToast('Invalid Coupon Code', 'error');
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverySlot) {
        addToast("Please select a delivery slot", "error");
        return;
    }
    setLoading(true);
    
    const fullAddress = `${formData.address}, ${formData.city} - ${formData.zip}`;
    const paymentLabel = formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    const orderId = await createOrder(cartItems, finalTotal, fullAddress, paymentLabel, formData.phone, fullName);
    
    if (walletUsed > 0) updateWallet(-walletUsed);

    clearCart();
    setLoading(false);
    addToast('Order placed successfully!', 'success');
    navigate(`/order-confirmation?id=${orderId}`);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Secure Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            
            {/* Step 1: Contact */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="bg-leaf-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                Shipping Details
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition" />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Address</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pincode</label>
                  <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none transition" />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Slot */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <span className="bg-leaf-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                    Delivery Schedule
                </h2>
                <DeliverySlotPicker onSelect={setDeliverySlot} />
            </div>

            {/* Step 3: Payment */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="bg-leaf-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
                Payment Method
              </h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-leaf-500 bg-leaf-50 ring-1 ring-leaf-500' : 'border-gray-200 hover:border-leaf-300'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="h-5 w-5 text-leaf-600 accent-leaf-600" />
                  <div className="ml-4 flex items-center gap-4 flex-grow">
                    <div className="p-2 bg-white rounded-lg border border-gray-100"><Banknote className="text-leaf-700" size={24} /></div>
                    <div>
                      <span className="block font-bold text-gray-900">Cash on Delivery</span>
                      <span className="block text-sm text-gray-500">Pay upon delivery</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedUnit}`} className="flex gap-4">
                       <div className="relative shrink-0">
                         <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                         <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.quantity}</span>
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name.en}</p>
                         <p className="text-xs text-gray-500">{item.selectedUnit}</p>
                         <p className="text-sm font-medium text-gray-600 mt-1">{formatPrice(item.price * item.quantity)}</p>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6 pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Discount Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)} 
                      placeholder="Ex: FRESH20" 
                      className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-leaf-500 transition uppercase"
                    />
                    <button type="button" onClick={handleApplyCoupon} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800">Apply</button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                  <div className="flex justify-between text-gray-600 text-sm"><span>Shipping</span><span>{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600 text-sm font-bold"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between text-gray-900 font-bold text-2xl pt-4 mt-2 border-t border-dashed border-gray-200"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-leaf-200 disabled:opacity-70 flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? 'Processing...' : `Pay ${formatPrice(finalTotal)}`}
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};