
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Settings, MapPin, CreditCard, Bell, Heart, LogOut, 
  Crown, ChevronRight, User, Camera, Plus, Trash2, Home, 
  TrendingUp, DollarSign, HelpCircle, Gift, Share2, Mail, Lock, Shield, Truck,
  Leaf, Globe, Smartphone, Sun, Moon, AlertTriangle, Key, Save
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useCart } from '../services/CartContext';
import { useToast } from '../services/ToastContext';

export const Account: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { orders } = useOrder();
  const { wishlist } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address State
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home', text: user?.address || '123 Green Market, Sector 4, New Delhi', isDefault: true },
  ]);
  const [newAddress, setNewAddress] = useState({ type: 'Home', text: '' });

  // Settings & Preferences State (Merged from separate page)
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false });
  const [notifications, setNotifications] = useState({ emailOrder: true, emailPromo: false, sms: true, whatsapp: true });
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // --- ANALYTICS ---
  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const loyaltyPoints = user?.walletBalance || 0;
  const nextTier = 500;
  const progressToNextTier = Math.min((loyaltyPoints / nextTier) * 100, 100);
  
  // Fake Impact Calc
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
    setAddresses([...addresses, { id: Date.now(), ...newAddress, isDefault: false }]);
    setNewAddress({ type: 'Home', text: '' });
    setIsEditingAddress(false);
    addToast("Address added successfully", "success");
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`FRESHLEAF-${user.name.split(' ')[0].toUpperCase()}20`);
    addToast("Referral code copied!", "success");
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile(profileData);
    setLoading(false);
    addToast("Profile updated", "success");
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
        addToast("Password changed successfully", "success");
    }, 1000);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

  // --- SUB-COMPONENTS ---
  
  const SpendingGraph = () => (
    <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
       {[35, 55, 40, 70, 50, 85].map((h, i) => (
           <div key={i} className="flex-1 flex flex-col justify-end group">
               <div className="w-full bg-leaf-100 rounded-t-lg relative transition-all duration-500 group-hover:bg-leaf-500" style={{ height: `${h}%` }}>
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       ₹{h * 120}
                   </div>
               </div>
               <div className="text-[10px] text-gray-400 text-center mt-2 font-bold uppercase">{['May','Jun','Jul','Aug','Sep','Oct'][i]}</div>
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
               <p className="text-leaf-100">You have <span className="font-bold text-white">{loyaltyPoints.toFixed(0)} Green Points</span> available.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[240px] shadow-lg">
               <div className="flex justify-between text-xs font-bold mb-3 text-leaf-100 uppercase tracking-wide">
                  <span>Silver Tier</span>
                  <span>Gold Tier</span>
               </div>
               <div className="w-full h-2.5 bg-gray-900/30 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-1000 shadow-[0_0_10px_rgba(253,224,71,0.6)]" style={{ width: `${progressToNextTier}%` }}></div>
               </div>
               <p className="text-[10px] text-white text-center font-medium">Earn {Math.max(0, nextTier - loyaltyPoints).toFixed(0)} more points to upgrade</p>
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
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">CO2 Saved</p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">By choosing local farmers, you've reduced transport emissions significantly.</p>
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

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
            <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-leaf-600 hover:underline">View All Orders</button>
         </div>
         <div className="space-y-4">
            {orders.slice(0, 3).map((order, i) => (
               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-leaf-200 transition group">
                  <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {order.status === 'Delivered' ? <CheckCircleIcon size={20}/> : <Truck size={20}/>}
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

  const SettingsView = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
       <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {['profile', 'security', 'notifications'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setSettingsTab(tab as any)}
                className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                    settingsTab === tab ? 'bg-leaf-50 text-leaf-800 border-b-2 border-leaf-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
             >
                {tab}
             </button>
          ))}
       </div>

       <div className="p-8 min-h-[400px]">
          {settingsTab === 'profile' && (
             <form onSubmit={handleProfileUpdate} className="max-w-2xl space-y-6 animate-in slide-in-from-left-4">
                <div className="flex items-center gap-6 mb-8">
                   <div className="relative group">
                      <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-gray-50 shadow-md object-cover" />
                      <button type="button" onClick={handleAvatarClick} className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full hover:bg-leaf-600 transition shadow-sm"><Camera size={12}/></button>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 text-lg">Edit Profile</h4>
                      <p className="text-xs text-gray-500">Update your personal details.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                      <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"/>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                      <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"/>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                      <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"/>
                   </div>
                </div>
                
                <div className="pt-4">
                   <button type="submit" disabled={loading} className="bg-leaf-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-leaf-700 transition shadow-lg flex items-center gap-2">
                      {loading ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                   </button>
                </div>
             </form>
          )}

          {settingsTab === 'security' && (
             <div className="max-w-2xl space-y-8 animate-in slide-in-from-right-4">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                   <h4 className="font-bold text-gray-900 flex items-center gap-2"><Key size={18} className="text-leaf-600"/> Change Password</h4>
                   <div className="grid grid-cols-1 gap-4">
                      <input type="password" placeholder="Current Password" value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
                      <input type="password" placeholder="New Password" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
                      <input type="password" placeholder="Confirm New Password" value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
                   </div>
                   <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-700 transition shadow-md">Update Password</button>
                </form>

                <div className="pt-6 border-t border-gray-100">
                   <div className="flex items-center justify-between mb-4">
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center gap-2"><Shield size={18} className="text-leaf-600"/> Two-Factor Auth</h4>
                         <p className="text-xs text-gray-500 mt-1">Add an extra layer of security.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={securityData.twoFactor} onChange={() => setSecurityData({...securityData, twoFactor: !securityData.twoFactor})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leaf-600"></div>
                      </label>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                   <h4 className="font-bold text-red-600 flex items-center gap-2 mb-2"><AlertTriangle size={18}/> Danger Zone</h4>
                   <p className="text-xs text-gray-500 mb-4">Once you delete your account, there is no going back.</p>
                   <button onClick={() => { if(window.confirm("Are you sure?")) logout(); }} className="border border-red-200 text-red-600 px-6 py-2 rounded-xl font-bold text-xs hover:bg-red-50 transition">Delete Account</button>
                </div>
             </div>
          )}

          {settingsTab === 'notifications' && (
             <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-6"><Bell size={18} className="text-leaf-600"/> Communication Preferences</h4>
                {[
                   { key: 'emailOrder', label: 'Order Updates', sub: 'Get emails about your order status.' },
                   { key: 'sms', label: 'SMS Notifications', sub: 'Receive delivery updates via SMS.' },
                   { key: 'emailPromo', label: 'Promotions', sub: 'Be the first to know about sales.' },
                   { key: 'whatsapp', label: 'WhatsApp Alerts', sub: 'Get invoice and tracking info on WhatsApp.' },
                ].map((item) => (
                   <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                         <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                         <p className="text-xs text-gray-500">{item.sub}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={(notifications as any)[item.key]} 
                            onChange={() => setNotifications({...notifications, [item.key]: !(notifications as any)[item.key]})} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leaf-600"></div>
                      </label>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );

  const AddressesView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
        <button onClick={() => setIsEditingAddress(true)} className="bg-leaf-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-leaf-700 transition shadow-md">
          <Plus size={16} /> Add New
        </button>
      </div>

      {isEditingAddress && (
        <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6 animate-in slide-in-from-top-4">
           <h4 className="font-bold text-gray-900 mb-4">New Delivery Address</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <select 
              value={newAddress.type} 
              onChange={e => setNewAddress({...newAddress, type: e.target.value})}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-leaf-500"
             >
               <option>Home</option>
               <option>Work</option>
               <option>Other</option>
             </select>
             <input 
              type="text" 
              placeholder="Full Address (House, Street, City, Zip)" 
              className="md:col-span-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-leaf-500"
              value={newAddress.text}
              onChange={e => setNewAddress({...newAddress, text: e.target.value})}
              required
             />
           </div>
           <div className="flex justify-end gap-3">
             <button type="button" onClick={() => setIsEditingAddress(false)} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700">Cancel</button>
             <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800">Save Address</button>
           </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div key={addr.id} className={`bg-white p-6 rounded-2xl shadow-sm border transition relative group ${addr.isDefault ? 'border-leaf-500 ring-1 ring-leaf-100' : 'border-gray-100 hover:border-gray-300'}`}>
             <div className="flex items-start justify-between mb-3">
               <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${addr.type === 'Home' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{addr.type}</span>
                 {addr.isDefault && <span className="text-leaf-600 text-xs font-bold flex items-center gap-1"><MapPin size={12} fill="currentColor"/> Default</span>}
               </div>
               <div className="flex gap-2">
                 <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
               </div>
             </div>
             <p className="text-gray-700 text-sm leading-relaxed font-medium">{addr.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const WalletView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-96 h-56 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
             <div className="flex justify-between items-start">
                <span className="font-bold tracking-widest text-sm text-gray-400 uppercase">FreshLeaf Pay</span>
                <Crown className="text-yellow-400" />
             </div>
             <div>
                <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wide">Available Balance</p>
                <h3 className="text-4xl font-black tracking-tight">{formatPrice(user.walletBalance)}</h3>
             </div>
             <div className="flex justify-between items-end">
                <p className="font-mono text-sm tracking-widest text-gray-400">**** **** **** 8821</p>
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-sm"></div>
                   <div className="w-8 h-8 rounded-full bg-yellow-500/80 backdrop-blur-sm"></div>
                </div>
             </div>
          </div>
          
          <div className="flex-grow bg-white rounded-3xl border border-gray-100 p-8 flex flex-col justify-center gap-4">
             <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200 group">
                   <Plus size={32} className="text-gray-400 group-hover:text-gray-900 mb-2 transition-colors"/>
                   <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Add Money</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-leaf-50 rounded-2xl hover:bg-leaf-100 transition border border-transparent hover:border-leaf-200 group">
                   <Gift size={32} className="text-leaf-400 group-hover:text-leaf-600 mb-2 transition-colors"/>
                   <span className="text-xs font-bold text-leaf-700 uppercase tracking-wide">Redeem Points</span>
                </button>
             </div>
          </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0,5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">Order Payment #{order.id}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">-{formatPrice(order.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">No transactions yet. Start shopping!</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );

  const ReferView = () => (
    <div className="text-center space-y-8 animate-in fade-in duration-500 py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
       <div className="inline-block bg-yellow-100 p-8 rounded-full text-yellow-600 mb-2 shadow-inner"><Gift size={64}/></div>
       <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Refer & Earn ₹100</h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">Invite your friends to FreshLeaf. They get 20% off their first order, and you get ₹100 in your wallet!</p>
       </div>
       
       <div className="max-w-sm mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-3 flex items-center justify-between shadow-sm">
          <span className="font-mono font-bold text-gray-800 text-lg px-4 tracking-wider">FRESH-{user.name.split(' ')[0].toUpperCase()}20</span>
          <button onClick={handleCopyReferral} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-lg">Copy Code</button>
       </div>

       <div className="flex justify-center gap-6 pt-4">
          <button className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 transition shadow-lg shadow-blue-200"><Share2 size={24}/></button>
          <button className="p-4 bg-green-500 text-white rounded-full hover:scale-110 transition shadow-lg shadow-green-200"><Mail size={24}/></button>
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
                    else setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-4 text-sm font-bold transition-all border-b border-gray-50 last:border-0 group ${
                    activeTab === item.id 
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
             {activeTab === 'support' && (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
                        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><HelpCircle size={32}/></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">How can we help?</h3>
                        <p className="text-gray-500 mb-6">Our dedicated support team is here for you 24/7.</p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Start Live Chat</button>
                            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">Email Support</button>
                        </div>
                    </div>
                 </div>
             )}
             {activeTab === 'refer' && <ReferView />}
             {activeTab === 'settings' && <SettingsView />}
          </div>

        </div>
      </div>
    </div>
  );
};

// Check Circle Icon
const CheckCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01 9 11.01"/></svg>
);
