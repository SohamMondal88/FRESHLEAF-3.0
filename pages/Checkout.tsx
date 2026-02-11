
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useToast } from '../services/ToastContext';
import { ShieldCheck, CreditCard, Banknote, MapPin, BellOff, PhoneOff, Package, Plus, Loader2, MessageSquare, Wallet } from 'lucide-react';
import { DeliverySlotPicker } from '../components/DeliverySlotPicker';
import { createServerOrder, verifyServerPayment } from '../services/paymentApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const { cartItems, bill, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [deliverySlot, setDeliverySlot] = useState<{date: string, time: string} | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [useWallet, setUseWallet] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone?.replace('+91', '') || '',
    address: user?.address || '',
    city: user?.city || 'Kolkata', 
    zip: user?.pincode || '',
    paymentMethod: 'razorpay'
  });

  // Redirect if cart empty
  useEffect(() => {
      if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  useEffect(() => {
      if (!user) {
          navigate('/login', { state: { from: '/checkout' } });
      }
  }, [navigate, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInstruction = (inst: string) => {
      setDeliveryInstructions(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
        addToast("Geolocation not supported", "error");
        return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lng = position.coords.longitude.toFixed(4);
            setFormData(prev => ({
                ...prev, 
                address: `GPS Location (${lat}, ${lng}) - Near Current Position`
            }));
            setGeoLocating(false);
            addToast("Location detected!", "success");
        },
        (error) => {
            setGeoLocating(false);
            addToast("Unable to retrieve location", "error");
        }
    );
  };

  // Payment Calculations
  const walletBalance = user?.walletBalance || 0;
  const walletDeduction = useWallet ? Math.min(walletBalance, bill.grandTotal) : 0;
  const finalPayable = Math.max(0, bill.grandTotal - walletDeduction);
  const pointsToEarn = parseFloat((bill.grandTotal * 0.1).toFixed(2));

  const processOrder = async (paymentId?: string) => {
    try {
        let methodString = '';
        if (finalPayable === 0) methodString = 'Wallet';
        else if (formData.paymentMethod === 'cod') methodString = useWallet ? 'Wallet + COD' : 'Cash on Delivery';
        else methodString = useWallet ? `Wallet + Online (Rzp: ${paymentId})` : `Online (Rzp: ${paymentId})`;

        const orderId = await createOrder(
            cartItems, 
            bill, // Pass full bill breakdown
            `${formData.address}, ${formData.city} - ${formData.zip}`, 
            methodString, 
            formData.phone, 
            `${formData.firstName} ${formData.lastName}`,
            deliverySlot,
            deliveryInstructions,
            customInstruction,
            walletDeduction
        );

        clearCart();
        navigate(`/order-confirmation?id=${orderId}`);
    } catch (error) {
        console.error("Order creation failed", error);
        addToast("Failed to create order. Please contact support if payment was deducted.", "error");
    } finally {
        setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.phone) {
        addToast("Please fill in all details", "error");
        return;
    }

    if (!deliverySlot) {
        addToast("Please select a delivery slot", "error");
        return;
    }

    setLoading(true);

    // If fully paid by wallet
    if (finalPayable === 0) {
        await processOrder();
        return;
    }

    if (formData.paymentMethod === 'cod') {
        await processOrder();
    } else {
        if (!window.Razorpay) {
            addToast("Razorpay SDK failed to load. Please refresh.", "error");
            setLoading(false);
            return;
        }

        if (!user) {
            addToast("Please login again to continue payment", "error");
            setLoading(false);
            return;
        }

        const currentUserId = user.id;

        let serverOrder: any;
        try {
            serverOrder = await createServerOrder({
                amountPaise: Math.round(finalPayable * 100),
                userId: currentUserId,
                purpose: 'checkout'
            });
        } catch (error: any) {
            addToast(error.message || "Unable to initialize payment", "error");
            setLoading(false);
            return;
        }

        const options = {
            key: serverOrder.key,
            amount: serverOrder.amount,
            currency: serverOrder.currency || "INR",
            name: "FreshLeaf",
            description: "Fresh Vegetables & Fruits Order",
            image: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png",
            order_id: serverOrder.id,
            handler: async function (response: any) {
                if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
                    try {
                        await verifyServerPayment({
                            userId: currentUserId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: finalPayable,
                            paymentMethod: 'Online (Razorpay)',
                            walletUsed: walletDeduction,
                            purpose: 'checkout'
                        });
                        addToast("Payment Successful!", "success");
                        processOrder(response.razorpay_payment_id);
                    } catch (error: any) {
                        addToast(error.message || "Payment verification failed", "error");
                        setLoading(false);
                    }
                } else {
                    addToast("Payment not completed", "error");
                    setLoading(false);
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: user?.email || "",
                contact: formData.phone
            },
            theme: { color: "#4CAF50" },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                    addToast("Payment cancelled", "info");
                }
            }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any){
                addToast(response.error.description || "Payment Failed", "error");
                setLoading(false);
            });
            rzp1.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            addToast("Payment Gateway Error", "error");
            setLoading(false);
        }
    }
  };

  const instructionOptions = [
      { id: 'door', label: 'Leave at Door', icon: Package },
      { id: 'bell', label: 'No Doorbell', icon: BellOff },
      { id: 'call', label: 'Call on Arrival', icon: PhoneOff },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-slate-50 py-8 font-sans sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-60"><div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl"></div><div className="absolute -left-24 top-1/2 h-72 w-72 rounded-full bg-teal-100 blur-3xl"></div></div><div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-6 rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-lg shadow-emerald-100/40 backdrop-blur sm:mb-8 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Secure checkout</p><h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Complete your order</h1><p className="mt-2 text-sm text-gray-600">Fast delivery, secure payment, and real-time order confirmation.</p></div>
        
        <form onSubmit={handlePayment} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Delivery Slot */}
            <div className="rounded-3xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-100/40 sm:p-6 xl:col-span-8">
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={16}/> Delivery Slot
                </h3>
                <DeliverySlotPicker onSelect={setDeliverySlot} />
                {deliverySlot && (
                    <div className="mt-4 rounded-xl bg-leaf-50 border border-leaf-100 p-3 text-xs font-bold text-leaf-700">
                        Scheduled for {deliverySlot.date} • {deliverySlot.time}
                    </div>
                )}
            </div>
            
            {/* Delivery Instructions */}
            <div className="rounded-3xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-100/40 sm:p-6 xl:col-span-8">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2"><MessageSquare size={16}/> Delivery Instructions</h3>
                
                <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {instructionOptions.map(inst => (
                        <button
                            key={inst.id}
                            type="button"
                            onClick={() => toggleInstruction(inst.label)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                deliveryInstructions.includes(inst.label) 
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <inst.icon size={20} className="mb-1" />
                            <span className="text-[10px] font-bold text-center leading-tight">{inst.label}</span>
                        </button>
                    ))}
                </div>
                
                <input 
                    type="text" 
                    placeholder="Any specific directions? (e.g. Near blue gate)"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>

            {/* Address */}
            <div className="rounded-3xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-100/40 sm:p-6 xl:col-span-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-gray-900">Address Details</h3>
                    <button type="button" onClick={detectLocation} className="text-xs font-bold text-leaf-600 flex items-center gap-1 hover:underline">
                        <MapPin size={12}/> {geoLocating ? 'Detecting...' : 'Detect Location'}
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input required name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                        <input required name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    </div>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Mobile Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="House / Flat / Block No." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                        <input required name="zip" value={formData.zip} onChange={handleInputChange} placeholder="Pincode" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-3xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-100/40 sm:p-6 xl:col-span-8">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Item Total</span>
                        <span>₹{bill.itemTotal}</span>
                    </div>
                    {bill.discount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                            <span>Discounts</span>
                            <span>- ₹{bill.discount}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Handling Fee</span>
                        <span>₹{bill.handlingFee}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Platform Fee</span>
                        <span>₹{bill.platformFee}</span>
                    </div>
                    {bill.deliveryFee > 0 && (
                        <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>₹{bill.deliveryFee}</span>
                        </div>
                    )}
                    {bill.smallCartFee > 0 && (
                        <div className="flex justify-between">
                            <span>Small Cart Fee</span>
                            <span>₹{bill.smallCartFee}</span>
                        </div>
                    )}
                    {bill.tip > 0 && (
                        <div className="flex justify-between">
                            <span>Delivery Tip</span>
                            <span>₹{bill.tip}</span>
                        </div>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center text-sm font-extrabold">
                    <span>Grand Total</span>
                    <span>₹{bill.grandTotal}</span>
                </div>
            </div>

            {/* Wallet & Payment */}
            <div className="rounded-3xl border border-emerald-100/70 bg-white p-5 shadow-sm shadow-emerald-100/40 sm:p-6 xl:col-span-4 xl:sticky xl:top-24">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Payment</h3>
                
                {/* Wallet Toggle */}
                {walletBalance > 0 && (
                    <label className="flex items-center justify-between p-4 mb-4 rounded-xl border border-yellow-200 bg-yellow-50/50 cursor-pointer hover:bg-yellow-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700"><Wallet size={20}/></div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">Use Wallet Balance</p>
                                <p className="text-xs text-gray-500">Available: ₹{walletBalance}</p>
                            </div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={useWallet} 
                            onChange={() => setUseWallet(!useWallet)} 
                            className="w-5 h-5 accent-yellow-600 rounded"
                        />
                    </label>
                )}

                {walletDeduction > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-green-600 mb-4 px-2">
                        <span>Wallet Deduction</span>
                        <span>- ₹{walletDeduction}</span>
                    </div>
                )}

                {/* Main Methods (Only if amount remains) */}
                {finalPayable > 0 && (
                    <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-leaf-500 bg-leaf-50 ring-1 ring-leaf-200' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={() => setFormData({...formData, paymentMethod: 'razorpay'})} className="accent-leaf-600 w-5 h-5" />
                            <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18} className="text-leaf-600"/> Pay Online (Razorpay)</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Fast</span>
                            </div>
                        </label>
                        <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-leaf-500 bg-leaf-50 ring-1 ring-leaf-200' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} className="accent-leaf-600 w-5 h-5" />
                            <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-gray-800 flex items-center gap-2"><Banknote size={18} className="text-gray-600"/> Cash on Delivery</span>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            {/* Total & Action */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl shadow-slate-300/40 sm:p-6 xl:col-span-4 xl:sticky xl:top-[35rem]">
                <div className="flex justify-between items-center mb-4 text-gray-300 text-sm">
                    <span>Order Total</span>
                    <span>₹{bill.grandTotal}</span>
                </div>
                {walletDeduction > 0 && (
                    <div className="flex justify-between items-center mb-4 text-yellow-400 text-sm font-bold">
                        <span>Wallet Used</span>
                        <span>- ₹{walletDeduction}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mb-6 text-xl font-extrabold">
                    <span>To Pay</span>
                    <span>₹{finalPayable}</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center mb-4">
                    <p className="text-xs text-green-300 font-bold">You will earn {pointsToEarn} points on this order!</p>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 font-bold text-white shadow-lg shadow-emerald-800/30 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" size={24}/> : <ShieldCheck size={20}/>}
                    {loading ? 'Processing...' : (finalPayable === 0 ? 'Place Order' : `Pay ₹${finalPayable}`)}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
