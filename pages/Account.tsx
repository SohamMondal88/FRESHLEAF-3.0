import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, Settings, MapPin, CreditCard, Bell, Heart, LogOut, 
  Crown, ChevronRight, User, Camera, Plus, Trash2, Home, 
  TrendingUp, DollarSign, Calendar, FileText, Edit2, X,
  HelpCircle, Gift, Share2, Mail, Lock, Shield, Truck
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

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    whatsapp: true,
    promos: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // --- ANALYTICS ---
  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  
  // Use actual wallet balance for "Points"
  const loyaltyPoints = user?.walletBalance || 0;
  // Tier logic based on spent or points
  const nextTier = 500;
  const progressToNextTier = Math.min((loyaltyPoints / nextTier) * 100, 100);

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price);

  // --- VIEWS ---
  
  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Loyalty Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-leaf-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Green Loyalty Points</p>
               <h2 className="text-5xl font-extrabold mb-2">{loyaltyPoints.toFixed(2)}</h2>
               <p className="text-sm text-gray-300">Equivalent to {formatPrice(loyaltyPoints)} discount</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl min-w-[200px]">
               <div className="flex justify-between text-xs font-bold mb-2">
                  <span>Silver Member</span>
                  <span>Gold Member</span>
               </div>
               <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-leaf-400 to-leaf-200 transition-all duration-1000" style={{ width: `${progressToNextTier}%` }}></div>
               </div>
               <p className="text-[10px] text-gray-400 mt-2 text-center">{Math.max(0, nextTier - loyaltyPoints).toFixed(2)} points to upgrade</p>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
            { label: 'Total Orders', value: orders.length, sub: 'Lifetime', icon: Package },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, sub: 'Lifetime', icon: DollarSign },
            { label: 'Active Orders', value: activeOrders, sub: 'Tracking', icon: Truck },
            { label: 'Wishlist', value: wishlist.length, sub: 'Saved Items', icon: Heart }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-leaf-200 transition">
                <div className="text-gray-400 mb-2"><stat.icon size={20}/></div>
                <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
        ))}
      </div>

      {/* Recent Activity Mock */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
         <div className="space-y-6 relative pl-4 border-l border-gray-100">
            {orders.slice(0, 3).map((order, i) => (
               <div key={i} className="relative pl-6">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-leaf-500 rounded-full border-2 border-white shadow-sm"></div>
                  <p className="text-sm font-bold text-gray-900">Order #{order.id} Placed</p>
                  <p className="text-xs text-gray-500 mt-1">{order.date} • {order.items.length} items • ₹{order.total}</p>
               </div>
            ))}
            {orders.length === 0 && <p className="text-sm text-gray-400 italic">No recent activity.</p>}
         </div>
      </div>
    </div>
  );

  const AddressesView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
        <button onClick={() => setIsEditingAddress(true)} className="bg-leaf-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-leaf-700 transition">
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
      {/* Cards Visualization */}
      <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-96 h-56 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
             <div className="flex justify-between items-start">
                <span className="font-bold tracking-widest text-sm text-gray-400">FreshLeaf Pay</span>
                <Crown className="text-yellow-400" />
             </div>
             <div>
                <p className="text-xs text-gray-400 mb-1">Wallet Balance</p>
                <h3 className="text-3xl font-extrabold tracking-tight">{formatPrice(user.walletBalance)}</h3>
             </div>
             <div className="flex justify-between items-end">
                <p className="font-mono text-sm tracking-widest">**** **** **** 8821</p>
                <div className="w-8 h-5 bg-red-500/80 rounded-full relative">
                   <div className="w-8 h-5 bg-yellow-500/80 rounded-full absolute -left-3"></div>
                </div>
             </div>
          </div>
          
          <div className="flex-grow bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-center gap-4">
             <h3 className="font-bold text-gray-900">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                   <Plus size={24} className="text-gray-600 mb-2"/>
                   <span className="text-xs font-bold text-gray-700">Add Money</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-leaf-50 rounded-xl hover:bg-leaf-100 transition">
                   <Gift size={24} className="text-leaf-600 mb-2"/>
                   <span className="text-xs font-bold text-leaf-700">Redeem Points</span>
                </button>
             </div>
          </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0,5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Order Payment #{order.id}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-500">-{formatPrice(order.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No transactions.</td></tr>}
            </tbody>
        </table>
      </div>
    </div>
  );

  const SupportView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
             <HelpCircle className="text-blue-600 mb-4" size={32} />
             <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help with an Order?</h3>
             <p className="text-sm text-gray-600 mb-4">Our support team is available from 9 AM to 9 PM.</p>
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Raise a Ticket</button>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-green-700 uppercase">Live Chat</span>
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Chat with Us</h3>
             <p className="text-sm text-gray-600 mb-4">Get instant answers to your queries.</p>
             <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition">Start Chat</button>
          </div>
       </div>

       <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Ticket History</h3>
          <p className="text-sm text-gray-400 italic">No active support tickets.</p>
       </div>
    </div>
  );

  const ReferView = () => (
    <div className="text-center space-y-8 animate-in fade-in duration-500 py-8">
       <div className="inline-block bg-yellow-100 p-6 rounded-full text-yellow-600 mb-2"><Gift size={48}/></div>
       <h2 className="text-3xl font-extrabold text-gray-900">Refer & Earn ₹100</h2>
       <p className="text-gray-500 max-w-md mx-auto">Invite your friends to FreshLeaf. They get 20% off their first order, and you get ₹100 in your wallet!</p>
       
       <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-gray-300 rounded-xl p-2 flex items-center justify-between">
          <span className="font-mono font-bold text-gray-800 px-4">FRESH-{user.name.split(' ')[0].toUpperCase()}20</span>
          <button onClick={handleCopyReferral} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Copy Code</button>
       </div>

       <div className="flex justify-center gap-4">
          <button className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition"><Share2 size={20}/></button>
          <button className="p-3 bg-green-500 text-white rounded-full hover:scale-110 transition"><Mail size={20}/></button>
       </div>
    </div>
  );

  const SettingsView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in duration-500">
       <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell size={18}/> Notification Preferences</h3>
          <div className="space-y-3">
             {Object.entries(notifications).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                   <span className="text-sm font-medium text-gray-700 capitalize">{key === 'promos' ? 'Marketing Promotions' : `${key} Notifications`}</span>
                   <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${val ? 'bg-leaf-500' : 'bg-gray-300'}`} onClick={(e) => { e.preventDefault(); setNotifications({...notifications, [key]: !val}) }}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${val ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </div>
                </label>
             ))}
          </div>
       </div>

       <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={18}/> Security</h3>
          <button className="text-leaf-600 font-bold text-sm hover:underline flex items-center gap-1">Change Password</button>
       </div>

       <div className="pt-6 border-t border-gray-100">
          <button className="text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
             <Trash2 size={16}/> Delete Account
          </button>
       </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Account</h1>
            <p className="text-gray-500 mt-1">Manage your profile, orders, and rewards.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {user.isPro && <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1"><Crown size={10}/> Pro Member</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-leaf-600 to-leaf-500"></div>
               <div className="relative z-10 pt-12">
                 <div className="relative inline-block">
                   <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" 
                   />
                   <button 
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full hover:bg-leaf-600 transition shadow-sm"
                   >
                     <Camera size={14} />
                   </button>
                   <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                 </div>
                 
                 <h2 className="text-xl font-bold text-gray-900 mt-3">{user.name}</h2>
                 <p className="text-xs text-gray-500 mb-4">{user.email}</p>
                 
                 {!user.isPro && (
                    <Link to="/subscription" className="bg-gray-50 hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 border border-gray-200 hover:border-yellow-200 rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 transition w-full">
                      <Crown size={14} /> Upgrade to Pro
                    </Link>
                 )}
               </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                  className={`w-full flex items-center justify-between p-4 text-sm font-bold transition-all border-b border-gray-50 last:border-0 ${
                    activeTab === item.id 
                      ? 'bg-leaf-50 text-leaf-700 border-l-4 border-l-leaf-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:pl-5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} /> {item.label}
                  </div>
                  {activeTab === item.id && <ChevronRight size={16} />}
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
             {activeTab === 'support' && <SupportView />}
             {activeTab === 'refer' && <ReferView />}
             {activeTab === 'settings' && <SettingsView />}
          </div>

        </div>
      </div>
    </div>
  );
};