
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  Leaf, Facebook, Twitter, Instagram, Youtube
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { usePincode } from '../services/PincodeContext';
import { ChatBot } from './ChatBot';
import { BackToTop } from './BackToTop';
import { SmartChef } from './features/SmartChef';
import { Navbar } from './Navbar';
import { X, MapPin } from 'lucide-react';

export const Layout: React.FC = () => {
  const [showChef, setShowChef] = useState(false);
  const { pincode, setPincode, isServiceable, showModal, setShowModal } = usePincode();
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(7433\d{2})$/.test(pincodeInput)) {
        setPincodeError("We only deliver to pincodes starting with 7433XX");
        return;
    }
    setPincodeLoading(true);
    const success = await setPincode(pincodeInput);
    setPincodeLoading(false);
    if (!success) setPincodeError("Sorry, we do not deliver to this location yet.");
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-[#FAFAF9]">
      
      {/* Pincode Modal - Global Level */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 border border-gray-100">
                {!isServiceable && <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>}
                <div className="text-center mb-6">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 border border-green-100 shadow-sm"><MapPin size={32}/></div>
                    <h3 className="text-2xl font-extrabold text-gray-900">Check Delivery</h3>
                    <p className="text-gray-500 text-sm mt-2">Enter pincode to check availability.</p>
                </div>
                <form onSubmit={handlePincodeSubmit}>
                    <input type="text" maxLength={6} placeholder="Enter Pincode (7433XX)" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))} className="w-full text-center text-lg font-bold border border-gray-200 bg-gray-50 rounded-xl py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-leaf-500" />
                    {pincodeError && <p className="text-red-500 text-xs text-center mb-4 font-bold">{pincodeError}</p>}
                    <button type="submit" disabled={pincodeLoading} className="w-full bg-leaf-600 text-white font-bold py-3.5 rounded-xl hover:bg-leaf-700 transition shadow-lg">{pincodeLoading ? 'Checking...' : 'Check'}</button>
                </form>
            </div>
        </div>
      )}

      {/* New Modern Navbar */}
      <Navbar onOpenChef={() => setShowChef(true)} />

      <main className="flex-grow pt-24 lg:pt-32">
        <Outlet />
      </main>

      <ChatBot />
      <BackToTop />
      <SmartChef isOpen={showChef} onClose={() => setShowChef(false)} />
      
      {/* Enhanced Footer */}
      <footer className="bg-[#1a1a1a] text-white pt-20 pb-8 relative overflow-hidden mt-auto">
         {/* Background Pattern */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-leaf-900/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-900/10 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
         
         <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16 border-b border-white/10 pb-16">
               
               {/* Brand Column */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="flex items-center gap-2">
                     <div className="bg-leaf-600 p-2 rounded-xl text-white shadow-lg shadow-leaf-900/50"><Leaf size={28} fill="currentColor"/></div>
                     <span className="text-3xl font-black tracking-tight">FreshLeaf</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm max-w-sm font-medium">
                     Empowering farmers and nourishing families. FreshLeaf brings the farm to your doorstep in 24 hours, ensuring fair trade and zero waste.
                  </p>
                  <div className="flex gap-4">
                     {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-leaf-600 hover:text-white transition-all duration-300 hover:-translate-y-1">
                           <Icon size={18}/>
                        </a>
                     ))}
                  </div>
               </div>

               {/* Links Columns */}
               <div className="lg:col-span-2">
                  <h4 className="font-bold text-lg mb-6 text-white tracking-wide">Shop</h4>
                  <ul className="space-y-3 text-gray-400 text-sm font-medium">
                     <li><Link to="/shop?category=Fruit" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Fruits</Link></li>
                     <li><Link to="/shop?category=Veg" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Vegetables</Link></li>
                     <li><Link to="/shop?category=Exotic" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Exotic</Link></li>
                     <li><Link to="/shop" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">New Arrivals</Link></li>
                  </ul>
               </div>

               <div className="lg:col-span-2">
                  <h4 className="font-bold text-lg mb-6 text-white tracking-wide">Company</h4>
                  <ul className="space-y-3 text-gray-400 text-sm font-medium">
                     <li><Link to="/about" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">About Us</Link></li>
                     <li><Link to="/seller" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Become a Seller</Link></li>
                     <li><Link to="/blog" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Fresh Journal</Link></li>
                     <li><Link to="/contact" className="hover:text-leaf-400 transition hover:translate-x-1 inline-block">Contact</Link></li>
                  </ul>
               </div>

               {/* Newsletter Column */}
               <div className="lg:col-span-4">
                  <h4 className="font-bold text-lg mb-4 text-white tracking-wide">Stay Fresh</h4>
                  <p className="text-gray-400 text-sm mb-6 font-medium">Join 50,000+ subscribers for seasonal tips and exclusive deals.</p>
                  <div className="relative group">
                     <input type="email" placeholder="Email address" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-leaf-500 focus:bg-white/10 transition" />
                     <button className="absolute right-2 top-2 bottom-2 bg-leaf-600 hover:bg-leaf-500 text-white px-4 rounded-lg font-bold text-xs transition shadow-lg">Subscribe</button>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500 font-bold tracking-wide">
               <p>© {new Date().getFullYear()} FreshLeaf Technologies Pvt Ltd.</p>
               <div className="flex gap-6">
                  <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
                  <Link to="/terms" className="hover:text-white transition">Terms</Link>
                  <Link to="/security" className="hover:text-white transition">Security</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
