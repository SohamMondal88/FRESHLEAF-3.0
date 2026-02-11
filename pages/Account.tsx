
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Settings, MapPin, CreditCard, Bell, Heart, LogOut, 
  Crown, ChevronRight, User, Camera, Plus, Trash2, Home, 
  TrendingUp, DollarSign, HelpCircle, Gift, Share2, Mail, Lock, Shield, Truck,
  Leaf, Globe, Smartphone, Sun, Moon, AlertTriangle, Key, Save, CheckCircle
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useCart } from '../services/CartContext';
import { useToast } from '../services/ToastContext';
import { auth, db } from '../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Transaction } from '../types';
import { createServerOrder, verifyServerPayment } from '../services/paymentApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Account: React.FC = () => {
  const { user, logout, updateProfile, updateWallet } = useAuth();
  const { orders } = useOrder();
  const { wishlist } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const supportPhone = import.meta.env.VITE_SUPPORT_PHONE as string | undefined;
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address State
  const [addresses, setAddresses] = useState<{ id: number; type: string; text: string; isDefault: boolean }[]>([]);
  const [newAddress, setNewAddress] = useState({ type: 'Home', text: '' });

  // Settings & Preferences State (Merged from separate page)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false });
  const [notifications, setNotifications] = useState({ emailOrder: true, emailPromo: false, sms: true, whatsapp: true });
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletTopup, setWalletTopup] = useState(500);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const primaryAddress = user.address ? [{
      id: Date.now(),
      type: 'Home',
      text: user.address,
      isDefault: true
    }] : [];
    setAddresses(primaryAddress);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', user.id));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as Transaction));
        setTransactions(fetched);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  // --- ANALYTICS ---
  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const loyaltyPoints = user?.walletBalance || 0;
  const nextTier = 500;
  const progressToNextTier = Math.min((loyaltyPoints / nextTier) * 100, 100);
  const co2Saved = (orders.length * 2.5).toFixed(1); 

  if (!user) return null;

  // --- HANDLERS ---
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfile({ avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.text) return;
    const newAddrObj = { id: Date.now(), ...newAddress, isDefault: addresses.length === 0 };
    setAddresses([...addresses, newAddrObj]);
    setNewAddress({ type: 'Home', text: '' });
    setIsEditingAddress(false);
    
    if (newAddrObj.isDefault) {
        updateProfile({ address: newAddrObj.text });
    }
    addToast("Address added successfully", "success");
  };

  const handleDeleteAddress = (id: number) => {
      const filtered = addresses.filter(a => a.id !== id);
      setAddresses(filtered);
      addToast("Address removed", "info");
  };

  const handleSetDefaultAddress = (id: number) => {
      const updated = addresses.map(a => ({...a, isDefault: a.id === id}));
      setAddresses(updated);
      const defaultAddr = updated.find(a => a.id === id);
      if (defaultAddr) updateProfile({ address: defaultAddr.text });
      addToast("Default address updated", "success");
  };

  const handleCopyReferral = () => {
    const code = `FRESH-${user.name.split(' ')[0].toUpperCase()}20`;
    navigator.clipboard.writeText(code);
    addToast("Referral code copied!", "success");
  };

  const handleRedeemPoints = async () => {
      if (loyaltyPoints < 100) {
          addToast("Need at least 100 points to redeem", "error");
          return;
      }
      
      const confirm = window.confirm(`Redeem 100 points for ₹10 Wallet Balance?`);
      if (confirm) {
          await updateWallet(10); 
          addToast("₹10 added to your wallet!", "success");
      }
  };

  const handleWalletTopup = async () => {
    if (!window.Razorpay) {
      addToast("Razorpay SDK failed to load. Please refresh.", "error");
      return;
    }
    if (walletTopup < 50) {
      addToast("Minimum top-up is ₹50", "error");
      return;
    }
    if (!user) return;
    setWalletLoading(true);

    const currentUserId = user.id;

    let serverOrder: any;
    try {
      serverOrder = await createServerOrder({
        amountPaise: Math.round(walletTopup * 100),
        userId: currentUserId,
        purpose: 'wallet_topup'
      });
    } catch (error: any) {
      setWalletLoading(false);
      addToast(error.message || 'Unable to initialize payment', 'error');
      return;
    }

    const options = {
      key: serverOrder.key,
      amount: serverOrder.amount,
      currency: serverOrder.currency || 'INR',
      order_id: serverOrder.id,
      name: 'FreshLeaf Wallet',
      description: 'Wallet Top-up',
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone
      },
      theme: {
        color: '#2b8a5a'
      },
      handler: async (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) => {
        try {
          if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
            await verifyServerPayment({
              userId: currentUserId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: walletTopup,
              paymentMethod: 'Wallet Top-up (Razorpay)',
              purpose: 'wallet_topup'
            });
            await updateWallet(walletTopup);
            await addDoc(collection(db, 'transactions'), {
              userId: currentUserId,
              orderId: `wallet-topup-${Date.now()}`,
              amount: walletTopup,
              paymentMethod: 'Wallet Top-up (Razorpay)',
              status: 'paid',
              currency: 'INR',
              createdAt: Date.now()
            });
            addToast("Wallet updated successfully!", "success");
          }
        } catch (error: any) {
          addToast(error.message || 'Payment verification failed', 'error');
        } finally {
          setWalletLoading(false);
        }
      },
      modal: {
        ondismiss: () => setWalletLoading(false)
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setWalletLoading(false);
      console.error("Razorpay Error:", error);
      addToast("Unable to start payment. Please try again.", "error");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(profileData);
    setLoading(false);
    addToast("Profile updated", "success");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!securityData.newPassword || securityData.newPassword !== securityData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      if (!auth.currentUser.email) throw new Error("Email not available for re-authentication");
      const credential = EmailAuthProvider.credential(auth.currentUser.email, securityData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, securityData.newPassword);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false });
      addToast("Password changed successfully", "success");
    } catch (error: any) {
      console.error("Password update failed:", error);
      addToast(error.message || "Unable to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

  // --- SUB-COMPONENTS ---
  
  const monthlySpending = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        total: 0
      };
    });

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      const target = months.find((month) => month.key === key);
      if (target) {
        target.total += order.total;
      }
    });

    const maxTotal = Math.max(1, ...months.map((month) => month.total));
    return months.map((month) => ({
      ...month,
      height: Math.round((month.total / maxTotal) * 100)
    }));
  }, [orders]);

  const SpendingGraph = () => (
    <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
       {monthlySpending.map((month) => (
           <div key={month.key} className="flex-1 flex flex-col justify-end group">
               <div className="w-full bg-leaf-100 rounded-t-lg relative transition-all duration-500 group-hover:bg-leaf-500" style={{ height: `${month.height}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       ₹{Math.round(month.total)}
                   </div>
               </div>
               <div className="text-[10px] text-gray-400 text-center mt-2 font-bold uppercase">{month.label}</div>
           </div>
       ))}
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-leaf-800 to-leaf-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sun size={12}/> Good Morning
                  </span>
                  {user.isPro && <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-400/30 flex items-center gap-1"><Crown size={12}/> Pro Member</span>}
               </div>
               <h2 className="text-4xl font-extrabold mb-1">Hi, {user.name.split(' ')[0]}!</h2>
               <p className="text-leaf-100">You have <span className="font-bold text-white">{formatPrice(loyaltyPoints)} Wallet Balance</span> available.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[240px] shadow-lg">
               <div className="flex justify-between text-xs font-bold mb-3 text-leaf-100 uppercase tracking-wide">
                  <span>Silver Tier</span>
                  <span>Gold Tier</span>
               </div>
               <div className="w-full h-2.5 bg-gray-900/30 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-1000 shadow-[0_0_10px_rgba(253,224,71,0.6)]" style={{ width: `${progressToNextTier}%` }}></div>
               </div>
               <p className="text-[10px] text-white text-center font-medium">Earn more to upgrade</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Spending Trends */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><TrendingUp size={18} className="text-leaf-600"/> Monthly Spending</h3>
            <p className="text-xs text-gray-500 mb-4">Your fresh harvest expenses</p>
            <SpendingGraph />
         </div>

         {/* Eco Impact */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Leaf size={18} className="text-green-600"/> Eco Impact</h3>
            <p className="text-xs text-gray-500 mb-6">Your contribution to sustainability</p>
            
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-600 mb-3 relative">
                    <Globe size={32}/>
                    <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full animate-pulse border-2 border-white"></div>
                </div>
                <div className="text-3xl font-black text-gray-900">{co2Saved} kg</div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Estimated CO2 Saved</p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Estimated based on order volume and local delivery routes.</p>
            </div>
         </div>

         {/* Quick Stats */}
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                <Package size={24} className="text-blue-600 mb-2"/>
                <span className="text-2xl font-black text-gray-900">{orders.length}</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Total Orders</span>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                <Heart size={24} className="text-orange-600 mb-2"/>
                <span className="text-2xl font-black text-gray-900">{wishlist.length}</span>
                <span className="text-[10px] font-bold text-orange-600 uppercase">Saved Items</span>
            </div>
            <div className="col-span-2 bg-gray-50 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition" onClick={() => setActiveTab('wallet')}>
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-gray-900"><CreditCard size={18}/></div>
                    <div className="text-left">
                        <span className="block text-xs font-bold text-gray-500 uppercase">Wallet</span>
                        <span className="block font-black text-gray-900">{formatPrice(user.walletBalance)}</span>
                    </div>
                </div>
                <div className="bg-white p-1.5 rounded-lg text-gray-400 group-hover:text-leaf-600 transition"><ChevronRight size={16}/></div>
            </div>
         </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><CreditCard size={18} className="text-leaf-600"/> Recent Transactions</h3>
            <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-leaf-600 hover:underline">View Orders</button>
         </div>
         {transactions.length > 0 ? (
           <div className="space-y-4">
              {transactions.slice(0, 4).map((tx) => (
                 <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Order #{tx.orderId}</p>
                      <p className="text-sm font-semibold text-gray-800">{tx.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{formatPrice(tx.amount)}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${tx.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{tx.status}</p>
                    </div>
                 </div>
              ))}
           </div>
         ) : (
           <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No transactions yet.
           </div>
         )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
            <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-leaf-600 hover:underline">View All Orders</button>
         </div>
         <div className="space-y-4">
            {orders.slice(0, 3).map((order, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-leaf-200 transition group cursor-pointer" onClick={() => navigate(`/track-order/${order.id}`)}>
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {order.status === 'Delivered' ? <CheckCircle size={20}/> : <Truck size={20}/>}
                      </div>
                      <div>
                          <p className="font-bold text-gray-900">Order #{order.id}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.date} • {order.items.length} items</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${order.status === 'Delivered' ? 'text-green-600' : 'text-orange-500'}`}>{order.status}</p>
                  </div>
               </div>
            ))}
            {orders.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-400 italic mb-4">No recent activity.</p>
                    <Link to="/shop" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold">Start Shopping</Link>
                </div>
            )}
         </div>
      </div>
    </div>
  );

  const AddressesView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
          <p className="text-sm text-gray-500">Manage your delivery locations.</p>
        </div>
        <button 
          onClick={() => setIsEditingAddress(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-leaf-600 transition"
        >
          <Plus size={16}/> Add Address
        </button>
      </div>

      {isEditingAddress && (
        <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              value={newAddress.type}
              onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <input 
              value={newAddress.text}
              onChange={(e) => setNewAddress({ ...newAddress, text: e.target.value })}
              placeholder="House no, street, city, pincode"
              className="md:col-span-2 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-leaf-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-leaf-700 transition">Save Address</button>
            <button type="button" onClick={() => setIsEditingAddress(false)} className="text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-dashed border-gray-200 text-center text-sm text-gray-500">
          No addresses saved yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`bg-white p-5 rounded-2xl border ${address.isDefault ? 'border-leaf-500' : 'border-gray-100'} shadow-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{address.type}</span>
                    {address.isDefault && <span className="text-[10px] font-bold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">{address.text}</p>
                </div>
                <button onClick={() => handleDeleteAddress(address.id)} className="text-gray-400 hover:text-red-500 transition">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {!address.isDefault && (
                  <button onClick={() => handleSetDefaultAddress(address.id)} className="text-xs font-bold text-leaf-600 hover:underline">
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const WalletView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-leaf-700 to-leaf-500 rounded-3xl p-8 text-white shadow-xl">
        <p className="text-sm text-leaf-100">Wallet Balance</p>
        <div className="text-4xl font-extrabold mt-2">{formatPrice(user.walletBalance)}</div>
        <p className="text-xs text-leaf-100 mt-2">Use wallet balance for faster checkout and instant savings.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Money</h3>
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <input
            type="number"
            min={50}
            value={walletTopup}
            onChange={(e) => setWalletTopup(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium w-full md:max-w-[200px]"
          />
          <button
            onClick={handleWalletTopup}
            disabled={walletLoading}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-leaf-600 transition disabled:opacity-60"
          >
            {walletLoading ? 'Processing…' : 'Pay with Razorpay'}
          </button>
          <p className="text-xs text-gray-500">Minimum ₹50. Uses your configured Razorpay key.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          <button onClick={() => setActiveTab('dashboard')} className="text-xs font-bold text-leaf-600 hover:underline">Back to overview</button>
        </div>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Order #{tx.orderId}</p>
                  <p className="text-sm font-semibold text-gray-800">{tx.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">{formatPrice(tx.amount)}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${tx.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No wallet transactions yet.
          </div>
        )}
      </div>
    </div>
  );

  const ReferView = () => {
    const code = `FRESH-${user.name.split(' ')[0].toUpperCase()}20`;
    const shareText = encodeURIComponent(`Use my FreshLeaf referral code ${code} to get instant savings on your first order!`);
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Refer & Earn</h3>
          <p className="text-sm text-gray-500 mb-6">Invite friends and earn wallet credits when they order.</p>
          <div className="bg-leaf-50 border border-leaf-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Code</p>
              <p className="text-2xl font-extrabold text-leaf-700 tracking-wide">{code}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCopyReferral} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-leaf-600 transition">Copy Code</button>
              <a href={`https://wa.me/?text=${shareText}`} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:border-leaf-300 hover:text-leaf-700 transition flex items-center gap-2">
                <Share2 size={16}/> Share
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Share', detail: 'Send your code to friends & family.' },
            { title: 'Order', detail: 'They place their first order.' },
            { title: 'Earn', detail: 'You both receive wallet credits.' }
          ].map((step, idx) => (
            <div key={step.title} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-xs font-bold text-leaf-600 uppercase tracking-wide">Step {idx + 1}</div>
              <div className="text-lg font-bold text-gray-900 mt-2">{step.title}</div>
              <p className="text-sm text-gray-500 mt-2">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HelpDeskView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Help Desk</h3>
        <p className="text-sm text-gray-500 mb-6">We are here to help you with orders, payments, and account questions.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-5 rounded-2xl">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Support Phone</div>
            <p className="text-lg font-bold text-gray-900 mt-2">{supportPhone || 'Add VITE_SUPPORT_PHONE'}</p>
            {supportPhone && <a href={`tel:${supportPhone}`} className="text-sm text-leaf-600 font-bold hover:underline">Call now</a>}
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</div>
            <p className="text-lg font-bold text-gray-900 mt-2">support@freshleaf.in</p>
            <a href="mailto:support@freshleaf.in" className="text-sm text-leaf-600 font-bold hover:underline">Send email</a>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Help Center</div>
            <p className="text-sm text-gray-500 mt-2">Browse FAQs and delivery policies.</p>
            <Link to="/contact" className="text-sm text-leaf-600 font-bold hover:underline">Visit help center</Link>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-900 mb-4">Common Topics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Order delays', desc: 'Track your order timeline and see rider status.' },
            { title: 'Payment issues', desc: 'Find help with Razorpay or wallet payments.' },
            { title: 'Refunds', desc: 'Learn how we process refunds and returns.' },
            { title: 'Account updates', desc: 'Manage addresses, phone, and preferences.' }
          ].map((item) => (
            <div key={item.title} className="border border-gray-100 rounded-2xl p-4">
              <p className="font-bold text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your profile, orders, and rewards.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {user.isPro && <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide mt-2 shadow-sm border border-yellow-200"><Crown size={10}/> Pro Member</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-leaf-100/50 border border-gray-100 text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-leaf-600 to-leaf-500 transition-all duration-500 group-hover:scale-110"></div>
               <div className="relative z-10 pt-12">
                 <div className="relative inline-block">
                   <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                   />
                   <button 
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:bg-leaf-600 transition shadow-md hover:scale-110"
                   >
                     <Camera size={14} />
                   </button>
                   <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                 </div>
                 
                 <h2 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h2>
                 <p className="text-xs text-gray-500 mb-6 font-medium">{user.email}</p>
                 
                 {!user.isPro && (
                    <Link to="/subscription" className="bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 text-yellow-800 border border-yellow-200 rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition w-full shadow-sm hover:shadow-md">
                      <Crown size={14} /> Upgrade to Pro
                    </Link>
                 )}
               </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {[
                { id: 'dashboard', label: 'Overview', icon: Home },
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'addresses', label: 'Addresses', icon: MapPin },
                { id: 'wallet', label: 'Wallet', icon: CreditCard },
                { id: 'refer', label: 'Refer & Earn', icon: Gift },
                { id: 'support', label: 'Help Desk', icon: HelpCircle },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if(item.id === 'orders') navigate('/orders');
                    else if(item.id === 'settings') navigate('/settings');
                    else setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-4 text-sm font-bold transition-all border-b border-gray-50 last:border-0 group ${
                    activeTab === item.id && item.id !== 'orders' && item.id !== 'settings'
                      ? 'bg-leaf-50 text-leaf-700 border-l-4 border-l-leaf-600' 
                      : 'text-gray-500 hover:bg-gray-50 hover:pl-5 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={`transition-colors ${activeTab === item.id ? 'text-leaf-600' : 'text-gray-400 group-hover:text-gray-600'}`} /> {item.label}
                  </div>
                  {activeTab === item.id && <ChevronRight size={16} className="text-leaf-600"/>}
                </button>
              ))}
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 p-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-t border-gray-100"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </nav>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-9">
             {activeTab === 'dashboard' && <DashboardView />}
             {activeTab === 'addresses' && <AddressesView />}
             {activeTab === 'wallet' && <WalletView />}
             {activeTab === 'refer' && <ReferView />}
             {activeTab === 'support' && <HelpDeskView />}
             {/* Other view components would go here, simplified for brevity as logic is in DashboardView */}
          </div>

        </div>
      </div>
    </div>
  );
};
