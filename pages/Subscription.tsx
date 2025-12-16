import React from 'react';
import { Check, Star, Zap, Shield, Crown } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Subscription: React.FC = () => {
  const { user, joinMembership } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    joinMembership();
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-sm mb-6 uppercase tracking-wide">
            <Crown size={16} /> Premium Membership
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Upgrade to <span className="text-leaf-600">FreshLeaf Pro</span>
          </h1>
          <p className="text-xl text-gray-600">
            Get free delivery, exclusive discounts, and priority access to new harvests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-500 mb-2">Free</h3>
            <div className="text-4xl font-extrabold text-gray-900 mb-6">₹0 <span className="text-lg font-medium text-gray-400">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-green-500" size={20} /> Access to all products</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-green-500" size={20} /> Standard Delivery</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-green-500" size={20} /> Basic Support</li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold border border-gray-200 text-gray-600 cursor-not-allowed">Current Plan</button>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl transition-all transform md:-translate-y-4 relative flex flex-col text-white">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-leaf-500 to-leaf-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-bold text-leaf-300 mb-2">FreshLeaf Pro</h3>
            <div className="text-4xl font-extrabold text-white mb-6">₹199 <span className="text-lg font-medium text-gray-400">/mo</span></div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3"><div className="bg-leaf-500/20 p-1 rounded-full"><Check className="text-leaf-400" size={16} /></div> <b>Unlimited Free Delivery</b></li>
              <li className="flex items-center gap-3"><div className="bg-leaf-500/20 p-1 rounded-full"><Check className="text-leaf-400" size={16} /></div> <b>10% Off</b> on all orders</li>
              <li className="flex items-center gap-3"><div className="bg-leaf-500/20 p-1 rounded-full"><Check className="text-leaf-400" size={16} /></div> Priority 30-min Delivery</li>
              <li className="flex items-center gap-3"><div className="bg-leaf-500/20 p-1 rounded-full"><Check className="text-leaf-400" size={16} /></div> No Minimum Order</li>
            </ul>
            <button 
              onClick={handleJoin}
              disabled={user?.isPro}
              className="w-full py-4 rounded-xl font-bold bg-leaf-500 hover:bg-leaf-600 text-white transition-all shadow-lg shadow-leaf-900/50"
            >
              {user?.isPro ? 'Already a Member' : 'Join Pro Now'}
            </button>
          </div>

          {/* Family Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover transition-all border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-accent-orange mb-2">Family Pack</h3>
            <div className="text-4xl font-extrabold text-gray-900 mb-6">₹499 <span className="text-lg font-medium text-gray-400">/3mo</span></div>
            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-accent-orange" size={20} /> All Pro Benefits</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-accent-orange" size={20} /> Dedicated Nutritionist</li>
              <li className="flex items-center gap-3 text-gray-600"><Check className="text-accent-orange" size={20} /> Surprise Gift Box</li>
            </ul>
            <button className="w-full py-3 rounded-xl font-bold bg-orange-50 text-accent-orange hover:bg-orange-100 transition">Coming Soon</button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-leaf-50 rounded-full flex items-center justify-center text-leaf-600 mx-auto mb-4"><Zap size={32} /></div>
            <h4 className="font-bold text-gray-900 mb-2">Super Fast Delivery</h4>
            <p className="text-sm text-gray-500">Get your veggies in 15-30 minutes guaranteed.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"><Shield size={32} /></div>
            <h4 className="font-bold text-gray-900 mb-2">No Questions Refund</h4>
            <p className="text-sm text-gray-500">Don't like the quality? Instant refund to wallet.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4"><Star size={32} /></div>
            <h4 className="font-bold text-gray-900 mb-2">Exclusive Harvests</h4>
            <p className="text-sm text-gray-500">First access to seasonal exotic fruits.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4"><Crown size={32} /></div>
            <h4 className="font-bold text-gray-900 mb-2">Priority Support</h4>
            <p className="text-sm text-gray-500">Dedicated support line for Pro members.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
