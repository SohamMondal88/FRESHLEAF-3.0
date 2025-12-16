import React, { useState } from 'react';
import { Save, User, Mail, Phone, Lock, Bell, Check } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check size={18} /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <User className="text-leaf-600" size={20} /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full border border-gray-200 bg-gray-50 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:bg-white focus:outline-none transition" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/account')} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-leaf-600 text-white rounded-xl font-bold hover:bg-leaf-700 transition flex items-center gap-2 shadow-lg shadow-leaf-200">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};