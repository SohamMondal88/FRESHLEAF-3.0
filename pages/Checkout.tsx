
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useToast } from '../services/ToastContext';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Truck, Tag, X, Wallet, Clock, Lock, CheckCircle, Info } from 'lucide-react';
import { DeliverySlotPicker } from '../components/DeliverySlotPicker';

// Function to load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
    paymentMethod: 'razorpay' // Default to online
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

  const handlePlaceOrder = async (razorpayPaymentId?: string) => {
    const fullAddress = `${formData.address}, ${formData.city} - ${formData.zip}`;
    const paymentLabel = formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay/Online';
    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    const orderId = await createOrder(cartItems, finalTotal, fullAddress, paymentLabel, formData.phone, fullName);
    
    if (walletUsed > 0) updateWallet(-walletUsed);

    clearCart();
    setLoading(false);
    addToast('Order placed successfully!', 'success');
    navigate(`/order-confirmation?id=${orderId}`);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverySlot) {
        addToast("Please select a delivery slot", "error");
        return;
    }
    
    setLoading(true);

    if (formData.paymentMethod === 'cod') {
        // Direct COD Order
        await handlePlaceOrder();
    } else {
        // Razorpay Integration
        const res = await loadRazorpay();
        if (!res) {
            addToast('Razorpay SDK failed to load', 'error');
            setLoading(false);
            return;
        }

        // Create options for Razorpay
        // ENTER YOUR RAZORPAY KEY HERE
        const options = {
            key: "YOUR_RAZORPAY_KEY_ID", // Replace with your actual Key ID from Razorpay Dashboard
            amount: finalTotal * 100, // Amount in paise
            currency: "INR",
            name: "FreshLeaf Organic",
            description: "Payment for Order",
            image: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png", // Your logo
            handler: function (response: any) {
                // Payment Success
                addToast(`Payment ID: ${response.razorpay_payment_id}`, "success");
                handlePlaceOrder(response.razorpay_payment_id);
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: user?.email,
                contact: formData.phone
            },
            notes: {
                address: formData.address
            },
            theme: {
                color: "#4CAF50"
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
        
        // Handle closure without payment
        paymentObject.on('payment.failed', function (response: any){
            addToast("Payment Failed. Please try again.", "error");
            setLoading(false);
        });
    }
  };

  return (
    <div className="py-12 bg-[#f8fafc] min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">Checkout Securely</h1>
        
        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Delivery Details */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-leaf-500"></div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="bg-leaf-100 text-leaf-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold border border-leaf-200">1</span>
                Delivery Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-bold">+91</span>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" placeholder="House No, Street, Landmark"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">City</label>
                  <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Pincode</label>
                  <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition font-medium" />
                </div>
              </div>
            </div>

            {/* Step 2: Slot Selection */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-leaf-500"></div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <span className="bg-leaf-100 text-leaf-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold border border-leaf-200">2</span>
                    Schedule Delivery
                </h2>
                <DeliverySlotPicker onSelect={setDeliverySlot} />
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-leaf-500"></div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <span className="bg-leaf-100 text-leaf-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-extrabold border border-leaf-200">3</span>
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-leaf-500 bg-leaf-50/50 ring-2 ring-leaf-500' : 'border-gray-200 hover:border-leaf-300 bg-gray-50'}`}>
                  <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleInputChange} className="h-5 w-5 text-leaf-600 accent-leaf-600" />
                  <div className="ml-4 flex items-center gap-4 flex-grow">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm"><CreditCard className="text-blue-600" size={24} /></div>
                    <div>
                      <span className="block font-bold text-gray-900 text-sm">Pay Online</span>
                      <span className="block text-xs text-gray-500 mt-0.5">UPI, Cards, Netbanking</span>
                    </div>
                  </div>
                  {formData.paymentMethod === 'razorpay' && <div className="absolute top-4 right-4"><CheckCircle size={20} className="text-leaf-600"/></div>}
                </label>

                <label className={`relative flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-leaf-500 bg-leaf-50/50 ring-2 ring-leaf-500' : 'border-gray-200 hover:border-leaf-300 bg-gray-50'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="h-5 w-5 text-leaf-600 accent-leaf-600" />
                  <div className="ml-4 flex items-center gap-4 flex-grow">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm"><Banknote className="text-green-600" size={24} /></div>
                    <div>
                      <span className="block font-bold text-gray-900 text-sm">Cash on Delivery</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Pay at your doorstep</span>
                    </div>
                  </div>
                  {formData.paymentMethod === 'cod' && <div className="absolute top-4 right-4"><CheckCircle size={20} className="text-leaf-600"/></div>}
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
             <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
                <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <Truck size={20} className="text-leaf-600"/> Order Summary
                </h3>
                
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedUnit}`} className="flex gap-4 group">
                       <div className="relative shrink-0">
                         <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100" />
                         <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{item.quantity}</span>
                       </div>
                       <div className="flex-grow">
                         <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name.en}</p>
                         <p className="text-xs text-gray-500">{item.selectedUnit}</p>
                         <p className="text-xs font-bold text-leaf-700 mt-1">{formatPrice(item.price * item.quantity)}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6 pt-6 border-t border-gray-100">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Tag className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        placeholder="FRESH20" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-leaf-500 transition uppercase font-bold text-gray-700"
                        />
                    </div>
                    <button type="button" onClick={handleApplyCoupon} className="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-gray-800 transition">Apply</button>
                  </div>
                  {appliedCoupon && (
                      <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle size={12}/> Coupon {appliedCoupon} Applied!
                      </div>
                  )}
                </div>

                {/* Bill Details */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                      <span>Item Total</span>
                      <span className="font-bold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                      <span>Delivery Fee</span>
                      {deliveryCharge === 0 ? <span className="text-green-600 font-bold">Free</span> : <span>{formatPrice(deliveryCharge)}</span>}
                  </div>
                  {discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm font-bold">
                          <span>Discount</span>
                          <span>-{formatPrice(discount)}</span>
                      </div>
                  )}
                  {walletUsed > 0 && (
                      <div className="flex justify-between text-leaf-600 text-sm font-bold">
                          <span>Wallet Used</span>
                          <span>-{formatPrice(walletUsed)}</span>
                      </div>
                  )}
                  
                  <div className="flex justify-between text-gray-900 font-extrabold text-lg pt-3 mt-1 border-t border-gray-200">
                      <span>To Pay</span>
                      <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Wallet Toggle */}
                {user?.walletBalance > 0 && (
                    <label className="flex items-center gap-3 p-3 border border-dashed border-leaf-300 bg-leaf-50/50 rounded-xl cursor-pointer mb-6">
                        <input type="checkbox" checked={useWallet} onChange={() => setUseWallet(!useWallet)} className="w-5 h-5 rounded accent-leaf-600"/>
                        <div className="flex-grow">
                            <span className="text-sm font-bold text-gray-800 flex items-center gap-1"><Wallet size={14}/> Use Wallet Balance</span>
                            <span className="text-xs text-gray-500">Available: {formatPrice(user.walletBalance)}</span>
                        </div>
                    </label>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-2xl font-bold transition shadow-xl shadow-leaf-200 disabled:opacity-70 flex items-center justify-center gap-2 text-base group"
                >
                  {loading ? 'Processing Payment...' : (
                      <>
                        <Lock size={18} className="group-hover:scale-110 transition-transform"/> Pay Securely {formatPrice(finalTotal)}
                      </>
                  )}
                </button>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <ShieldCheck size={14}/> 100% Safe & Secure Payments
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};
