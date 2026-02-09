
import React, { useState } from 'react';
import { Check, Star, Zap, Shield, Crown, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../services/ToastContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Subscription: React.FC = () => {
  const { user, joinMembership } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = (planName: string, amount: number) => {
    if (!user) {
      addToast("Please login to subscribe", "info");
      navigate('/login');
      return;
    }

    if (user.isPro && planName === 'FreshLeaf Pro') {
        addToast("You are already a Pro member!", "info");
        return;
    }

    setLoading(planName);

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    if (!razorpayKey) {
      addToast("Payment configuration missing. Please contact support.", "error");
      setLoading(null);
      return;
    }

    // Razorpay Integration
    const options = {
      key: razorpayKey,
      amount: amount * 100, // paise
      currency: "INR",
      name: "FreshLeaf",
      description: `${planName} Subscription`,
      image: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png",
      handler: function (response: any) {
        if (response.razorpay_payment_id) {
            joinMembership();
            addToast(`Welcome to ${planName}!`, "success");
            navigate('/account');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone
      },
      theme: { color: "#EAB308" }, // Gold color for subscription
      modal: {
        ondismiss: function() {
            setLoading(null);
            addToast("Payment cancelled", "info");
        }
      }
    };

    try {
        if (!window.Razorpay) {
            addToast("Payment SDK not loaded", "error");
            setLoading(null);
            return;
        }
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(response: any){
            addToast(response.error.description || "Payment Failed", "error");
            setLoading(null);
        });
        rzp.open();
    } catch (e) {
        console.error(e);
        addToast("Payment Error", "error");
        setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-16 font-sans">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-xs mb-6 uppercase tracking-wider shadow-sm">
            <Crown size={14} className="fill-current" /> Premium Membership
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-leaf-400">FreshLeaf Pro</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            Unlock exclusive harvest deals, zero delivery fees, and priority support. Join the elite club of healthy eaters.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          
          {/* Basic Plan */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col h-[500px] hover:border-leaf-200 transition-all duration-300 group">
            <h3 className="text-xl font-bold text-gray-500 mb-2">Free</h3>
            <div className="text-5xl font-black text-gray-900 mb-6">₹0 <span className="text-lg font-medium text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">Perfect for trying out our fresh produce.</p>
            <ul className="space-y-4 flex-grow">
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-gray-100 p-1 rounded-full"><Check className="text-gray-600" size={14} /></div> Access to all products</li>
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-gray-100 p-1 rounded-full"><Check className="text-gray-600" size={14} /></div> Standard Delivery</li>
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-gray-100 p-1 rounded-full"><Check className="text-gray-600" size={14} /></div> Email Support</li>
            </ul>
            <button disabled className="w-full py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-400 cursor-not-allowed mt-auto">Current Plan</button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl transition-all transform md:-translate-y-6 relative flex flex-col h-[560px] text-white border-4 border-leaf-500/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-leaf-500 to-leaf-400 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
              <Star size={14} fill="currentColor"/> Most Popular
            </div>
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-leaf-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <h3 className="text-xl font-bold text-leaf-400 mb-2 mt-4">FreshLeaf Pro</h3>
            <div className="text-6xl font-black text-white mb-6">₹199 <span className="text-lg font-medium text-gray-400">/mo</span></div>
            <p className="text-sm text-gray-400 mb-8 border-b border-gray-800 pb-8">For families who love fresh food daily.</p>
            
            <ul className="space-y-5 flex-grow relative z-10">
              <li className="flex items-center gap-3 font-bold"><div className="bg-leaf-500 text-white p-1 rounded-full"><Check size={14} /></div> Unlimited Free Delivery</li>
              <li className="flex items-center gap-3 font-medium text-gray-300"><div className="bg-leaf-900 border border-leaf-700 p-1 rounded-full"><Check className="text-leaf-400" size={14} /></div> 10% Off on all orders</li>
              <li className="flex items-center gap-3 font-medium text-gray-300"><div className="bg-leaf-900 border border-leaf-700 p-1 rounded-full"><Check className="text-leaf-400" size={14} /></div> Priority 30-min Delivery</li>
              <li className="flex items-center gap-3 font-medium text-gray-300"><div className="bg-leaf-900 border border-leaf-700 p-1 rounded-full"><Check className="text-leaf-400" size={14} /></div> No Minimum Order Value</li>
            </ul>
            
            <button 
              onClick={() => handlePayment('FreshLeaf Pro', 199)}
              disabled={user?.isPro || loading === 'FreshLeaf Pro'}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-leaf-600 to-leaf-500 hover:from-leaf-500 hover:to-leaf-400 text-white transition-all shadow-lg shadow-leaf-900/50 mt-auto flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'FreshLeaf Pro' ? <Loader2 className="animate-spin" /> : <CreditCard size={18}/>}
              {user?.isPro ? 'Active Membership' : 'Join Pro Now'}
            </button>
          </div>

          {/* Family Plan */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col h-[500px] hover:border-orange-200 transition-all duration-300">
            <h3 className="text-xl font-bold text-orange-500 mb-2">Family Pack</h3>
            <div className="text-5xl font-black text-gray-900 mb-6">₹499 <span className="text-lg font-medium text-gray-400">/3mo</span></div>
            <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">Best value for larger households.</p>
            <ul className="space-y-4 flex-grow">
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-orange-50 p-1 rounded-full"><Check className="text-orange-500" size={14} /></div> All Pro Benefits</li>
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-orange-50 p-1 rounded-full"><Check className="text-orange-500" size={14} /></div> Dedicated Nutritionist</li>
              <li className="flex items-center gap-3 text-gray-600 font-medium"><div className="bg-orange-50 p-1 rounded-full"><Check className="text-orange-500" size={14} /></div> Quarterly Surprise Gift Box</li>
            </ul>
            <button 
                onClick={() => handlePayment('Family Pack', 499)}
                disabled={loading === 'Family Pack'}
                className="w-full py-4 rounded-xl font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition mt-auto flex items-center justify-center gap-2"
            >
                {loading === 'Family Pack' ? <Loader2 className="animate-spin text-orange-600" /> : 'Buy Family Pack'}
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
              { icon: Zap, title: "Super Fast", desc: "Get priority delivery slots during rush hours.", color: "text-yellow-500", bg: "bg-yellow-50" },
              { icon: Shield, title: "No Questions", desc: "Instant refund to wallet if quality issues.", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Star, title: "Exclusive", desc: "First access to seasonal exotic fruits.", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Crown, title: "VIP Support", desc: "Dedicated support line for Pro members.", color: "text-red-500", bg: "bg-red-50" },
          ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mx-auto mb-4`}>
                    <item.icon size={24} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};
