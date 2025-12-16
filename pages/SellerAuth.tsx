import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../services/ToastContext';
import { Sprout, Mail, Lock, User, MapPin, ArrowRight, Tractor } from 'lucide-react';

export const SellerAuth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmName: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        if (mode === 'login') {
          const success = await login(formData.email, formData.password, 'seller');
          if (success) {
              addToast("Welcome back!", "success");
              navigate('/seller/dashboard');
          } else {
              addToast("Invalid credentials or account not found", "error");
          }
        } else {
          const success = await signup(formData.name, formData.email, formData.password, 'seller', formData.farmName);
          if (success) {
              addToast("Farm registered successfully!", "success");
              navigate('/seller/dashboard');
          } else {
              addToast("Email already registered", "error");
          }
        }
    } catch (err) {
        addToast("Something went wrong", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-leaf-900"></div>
      <div className="absolute top-10 left-10 text-white/10"><Tractor size={120} /></div>
      <div className="absolute bottom-10 right-10 text-leaf-800/10"><Sprout size={150} /></div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg border border-gray-100 relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-leaf-700 font-bold mb-6 hover:underline">
            <ArrowRight className="rotate-180" size={16}/> Back to Home
          </Link>
          <div className="bg-leaf-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-leaf-600 shadow-inner">
            <Sprout size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? 'Seller Login' : 'Join as Farmer'}
          </h1>
          <p className="text-gray-500 mt-2">
            {mode === 'login' ? 'Access your dashboard & manage harvest' : 'Start selling your produce today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                    placeholder="Ramesh Kumar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Farm Name</label>
                <div className="relative">
                  <Tractor className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    required
                    value={formData.farmName}
                    onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                    placeholder="Ramesh Organic Farms"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                placeholder="seller@freshleaf.in"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Access Dashboard' : 'Register Farm')}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-600 mb-4">
            {mode === 'login' ? "Don't have a seller account?" : "Already registered?"}
          </p>
          <button 
            onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setFormData({ name: '', email: '', password: '', farmName: '', location: '' });
            }}
            className="text-leaf-700 font-bold hover:underline"
          >
            {mode === 'login' ? 'Register Now' : 'Login Here'}
          </button>
        </div>
      </div>
    </div>
  );
};
