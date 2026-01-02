
import React, { useState, useRef } from 'react';
import { 
  User, Mail, Phone, Lock, Bell, Shield, Globe, 
  Moon, Sun, LogOut, Trash2, Smartphone, Key, 
  CheckCircle, Save, Camera, CreditCard, AlertTriangle,
  ChevronRight, MapPin
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../services/ToastContext';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [loading, setLoading] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: 'Organic food enthusiast loving the fresh greens!',
    location: user?.city || 'Kolkata, India'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false
  });

  const [notifications, setNotifications] = useState({
    emailOrder: true,
    emailPromo: false,
    smsOrder: true,
    whatsapp: true,
    push: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'INR',
    theme: 'light'
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  // Handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateProfile({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      city: profileData.location
    });
    
    setLoading(false);
    addToast("Profile updated successfully", "success");
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast("Password changed successfully", "success");
    }, 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
        addToast("Profile picture updated", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const Tabs = [
    { id: 'profile', label: 'My Profile', icon: User, desc: 'Manage your personal details' },
    { id: 'security', label: 'Login & Security', icon: Shield, desc: 'Password and 2FA settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Manage communication preferences' },
    { id: 'preferences', label: 'Preferences', icon: Globe, desc: 'Language and regional settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Account Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {Tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all border-b border-gray-50 last:border-0 ${
                    activeTab === tab.id 
                      ? 'bg-leaf-50 text-leaf-800 border-l-4 border-l-leaf-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-l-transparent'
                  }`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-leaf-600' : 'text-gray-400'} />
                  <div>
                    <span className="font-bold block text-sm">{tab.label}</span>
                    <span className="text-xs text-gray-400 font-medium hidden xl:block">{tab.desc}</span>
                  </div>
                  <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === tab.id ? 'text-leaf-600' : 'text-gray-300'}`} />
                </button>
              ))}
              <div className="p-4 border-t border-gray-100 mt-2">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Avatar Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-leaf-400 to-leaf-600">
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-white bg-gray-100" />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-leaf-600 transition-colors"
                    >
                      <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-500 text-sm mb-3">{user.email}</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                      {user.role === 'seller' ? 'Partner Farmer' : 'Verified Customer'}
                    </span>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-leaf-600"/> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18}/>
                        <input 
                          type="text" 
                          value={profileData.location}
                          onChange={e => setProfileData({...profileData, location: e.target.value})}
                          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bio</label>
                      <textarea 
                        value={profileData.bio}
                        onChange={e => setProfileData({...profileData, bio: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition resize-none"
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-leaf-600 transition shadow-lg flex items-center gap-2">
                      {loading ? 'Saving...' : <><Save size={18}/> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form onSubmit={handlePasswordUpdate} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Key size={20} className="text-leaf-600"/> Change Password
                  </h3>
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={securityData.currentPassword}
                        onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={securityData.newPassword}
                        onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={securityData.confirmPassword}
                        onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-leaf-600 transition shadow-lg">
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield size={20} className="text-leaf-600"/> Two-Factor Authentication
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={securityData.twoFactor} onChange={() => setSecurityData({...securityData, twoFactor: !securityData.twoFactor})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-leaf-600"></div>
                    </label>
                  </div>
                  {securityData.twoFactor && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm flex items-center gap-2">
                      <CheckCircle size={16} /> 2FA is currently enabled via Email OTP.
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                   <h3 className="text-lg font-bold text-gray-900 mb-6">Active Sessions</h3>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border border-gray-200">
                               <Smartphone size={24} className="text-gray-600"/>
                            </div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">Chrome on iPhone 13</p>
                               <p className="text-xs text-gray-500">New Delhi, India • Active Now</p>
                            </div>
                         </div>
                         <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Current</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-60">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border border-gray-200">
                               <Globe size={24} className="text-gray-600"/>
                            </div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">Safari on MacOS</p>
                               <p className="text-xs text-gray-500">Kolkata, India • 2 days ago</p>
                            </div>
                         </div>
                         <button className="text-xs font-bold text-red-500 hover:underline">Revoke</button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Order Updates</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailOrder', label: 'Email Notifications', desc: 'Receive order confirmations and shipping updates via email.' },
                      { key: 'smsOrder', label: 'SMS Notifications', desc: 'Get important updates on your phone.' },
                      { key: 'whatsapp', label: 'WhatsApp Alerts', desc: 'Receive real-time delivery tracking on WhatsApp.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
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
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Marketing</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailPromo', label: 'Promotional Emails', desc: 'Be the first to know about sales and new harvests.' },
                      { key: 'push', label: 'Browser Push Notifications', desc: 'Get notified about flash deals even when not on the site.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
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
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Language</label>
                      <select 
                        value={preferences.language}
                        onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-white"
                      >
                        <option value="en">English (UK)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Currency</label>
                      <select 
                        value={preferences.currency}
                        onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 bg-gray-50 cursor-not-allowed"
                        disabled
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Appearance</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setPreferences({...preferences, theme: 'light'})}
                      className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme === 'light' ? 'border-leaf-600 bg-leaf-50 text-leaf-800' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <Sun size={24} />
                      <span className="font-bold text-sm">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => setPreferences({...preferences, theme: 'dark'})}
                      className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${preferences.theme === 'dark' ? 'border-leaf-600 bg-gray-800 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <Moon size={24} />
                      <span className="font-bold text-sm">Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div className="bg-red-50 p-8 rounded-2xl shadow-sm border border-red-100 mt-8">
                   <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                     <AlertTriangle size={20}/> Danger Zone
                   </h3>
                   <p className="text-red-600/80 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                   <button 
                    onClick={() => { if(window.confirm("Are you sure? This cannot be undone.")) { logout(); addToast("Account deleted", "info"); } }}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition shadow-lg shadow-red-200"
                   >
                     Delete Account
                   </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
