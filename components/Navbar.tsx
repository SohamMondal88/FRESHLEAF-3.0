
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Menu, X, User, Heart, 
  MapPin, Phone, Crown, Sprout, ChefHat, 
  Mic, ChevronDown, LogOut, LayoutDashboard, Settings as SettingsIcon, Loader2
} from 'lucide-react';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { usePincode } from '../services/PincodeContext';
import { useProduct } from '../services/ProductContext';
import { Product } from '../types';

interface NavbarProps {
  onOpenChef: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChef }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { cartItems, wishlist } = useCart();
  const { user, logout, loading } = useAuth();
  const { products } = useProduct();
  const { pincode, setShowModal } = usePincode();
  
  const location = useLocation();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Scroll Listener for Glass Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset state on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setShowProfileMenu(false);
    setSearchTerm('');
  }, [location]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const matches = products.filter(p => 
        p.name.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsSearchOpen(false);
      setSuggestions([]);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* 1. TOP UTILITY BAR (Hides on Scroll) */}
      <div className={`bg-leaf-900 text-white text-[11px] font-medium tracking-wide transition-all duration-500 ease-in-out z-50 relative overflow-hidden ${isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'}`}>
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex gap-6">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 hover:text-green-300 transition-colors group">
              <MapPin size={12} className="group-hover:animate-bounce" /> 
              <span className="truncate max-w-[150px]">{pincode ? `Delivering to ${pincode}` : "Select Location"}</span>
            </button>
            <a href="tel:+919876543210" className="hidden sm:flex items-center gap-1.5 hover:text-green-300 transition-colors">
              <Phone size={12} /> Support: +91 98765 43210
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/seller" className="flex items-center gap-1.5 hover:text-green-300 transition-colors">
              <Sprout size={12} /> Become a Seller
            </Link>
            <div className="w-px h-3 bg-white/20"></div>
            <Link to="/subscription" className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 transition-colors font-bold animate-pulse">
              <Crown size={12} /> Join Pro
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR (Sticky & Glass) */}
      <header 
        className={`fixed w-full z-40 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isScrolled 
            ? 'top-0 bg-white/70 backdrop-blur-xl shadow-lg border-b border-white/20 py-2 supports-[backdrop-filter]:bg-white/60' 
            : 'top-10 bg-white/40 backdrop-blur-sm border-b border-white/10 py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* LEFT: Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="bg-gradient-to-br from-leaf-600 to-leaf-500 text-white p-2.5 rounded-2xl shadow-lg shadow-leaf-200 group-hover:rotate-12 transition-transform duration-300">
                <Sprout size={24} fill="currentColor" className="text-white"/>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 leading-none tracking-tight font-sans">
                  Fresh<span className="text-leaf-600">Leaf</span>
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-0.5">Organic</span>
              </div>
            </Link>

            {/* CENTER: Desktop Navigation Pills */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/40 p-1.5 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                    location.pathname === link.path 
                      ? 'bg-white text-leaf-700 shadow-sm' 
                      : 'text-gray-600 hover:text-leaf-700 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Desktop Smart Search */}
              <div ref={searchRef} className="hidden xl:block relative group">
                <form onSubmit={handleSearchSubmit} className="relative z-10">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search fresh..." 
                    className="pl-11 pr-12 py-3 w-64 bg-white/50 border border-gray-200/50 rounded-full text-sm font-medium focus:bg-white focus:w-80 focus:border-leaf-200 focus:ring-4 focus:ring-leaf-500/10 transition-all duration-300 outline-none placeholder:text-gray-500 backdrop-blur-sm"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-leaf-600 transition-colors" />
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                    <button type="button" className="hover:text-leaf-600 transition-colors p-1 rounded-full hover:bg-leaf-50"><Mic size={16}/></button>
                  </div>
                </form>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full right-0 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl mt-4 border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 ring-1 ring-black/5">
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2 bg-gray-50/50 mb-1 rounded-lg">Top Matches</div>
                      {suggestions.map(s => (
                        <Link 
                          to={`/product/${s.id}`} 
                          key={s.id} 
                          className="flex items-center gap-3 p-2.5 hover:bg-leaf-50 rounded-xl transition-colors group/item"
                          onClick={() => { setSearchTerm(''); setSuggestions([]); }}
                        >
                          <img src={s.image} className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-100 group-hover/item:scale-105 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">{s.name.en}</p>
                            <p className="text-[10px] text-gray-500">{s.category}</p>
                          </div>
                          <ChevronDown className="-rotate-90 text-gray-300 group-hover/item:text-leaf-500" size={16}/>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="xl:hidden p-3 rounded-full text-gray-700 hover:bg-white/50 transition-colors active:scale-95"
              >
                <Search size={22} />
              </button>

              {/* AI Chef Button */}
              <button 
                onClick={onOpenChef} 
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-3 rounded-full font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all group"
              >
                <ChefHat size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden lg:inline">AI Chef</span>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="hidden sm:flex p-3 rounded-full text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all relative group active:scale-95">
                <Heart size={22} className="group-hover:scale-110 transition-transform"/>
                {wishlist.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="p-3 rounded-full text-gray-700 hover:bg-leaf-50 hover:text-leaf-600 transition-all relative group active:scale-95">
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform"/>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-leaf-600 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full border-2 border-white shadow-sm group-hover:-translate-y-1 transition-transform">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown (Replaces Login/Signup) */}
              <div ref={profileRef} className="relative hidden sm:block">
                {loading ? (
                  <div className="w-20 h-10 bg-gray-100 rounded-full animate-pulse flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  </div>
                ) : user ? (
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border transition-all duration-300 group ${
                      showProfileMenu 
                        ? 'bg-leaf-50 border-leaf-300 ring-2 ring-leaf-100' 
                        : 'bg-white/60 border-gray-200/50 hover:border-leaf-300 hover:shadow-md backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex flex-col items-end mr-1">
                      <span className="text-xs font-extrabold text-gray-700 max-w-[80px] truncate leading-none mb-0.5">{user.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold text-leaf-600 uppercase tracking-wider">{user.role === 'seller' ? 'Seller' : 'Member'}</span>
                    </div>
                    <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover bg-gray-100 border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
                    />
                  </button>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-leaf-600 hover:shadow-lg transition-all active:scale-95">
                    Login
                  </Link>
                )}

                {/* Dropdown Menu */}
                {showProfileMenu && user && (
                  <div className="absolute right-0 top-full mt-4 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50 ring-1 ring-black/5">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white/50">
                      <p className="font-bold text-gray-900 truncate text-base">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-3 flex gap-2">
                         <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">{user.isPro ? 'PRO' : 'Free'} Plan</span>
                         <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1"><Crown size={10}/> {user.walletBalance} Pts</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link to="/account" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-leaf-50 hover:text-leaf-700 transition-colors group">
                        <div className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-white text-gray-500 group-hover:text-leaf-600 transition"><User size={16} /></div> 
                        Dashboard
                      </Link>
                      <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-leaf-50 hover:text-leaf-700 transition-colors group">
                        <div className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-white text-gray-500 group-hover:text-leaf-600 transition"><LayoutDashboard size={16} /></div>
                        My Orders
                      </Link>
                      <Link to="/account" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-leaf-50 hover:text-leaf-700 transition-colors group">
                        <div className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-white text-gray-500 group-hover:text-leaf-600 transition"><SettingsIcon size={16} /></div>
                        Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1 mx-2"></div>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left group">
                        <div className="bg-red-50 p-1.5 rounded-lg group-hover:bg-white transition"><LogOut size={16} /></div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-3 text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. MOBILE SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute inset-0 bg-white z-50 px-4 flex items-center animate-in fade-in slide-in-from-top-5 h-20 shadow-md">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..." 
                className="w-full bg-gray-100 text-gray-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 font-medium"
              />
            </form>
            <button onClick={() => setIsSearchOpen(false)} className="ml-3 p-3 bg-gray-100 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition">
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      {/* 4. MOBILE DRAWER MENU */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-xs bg-white shadow-2xl transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="bg-leaf-600 p-1.5 rounded-lg text-white"><Sprout size={20} fill="currentColor"/></div>
              <span className="font-black text-xl text-gray-900">FreshLeaf</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:text-red-500 transition shadow-sm">
              <X size={20}/>
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto">
            {loading ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin text-leaf-600" /></div>
            ) : user ? (
              <div className="bg-leaf-50/50 border border-leaf-100 p-4 rounded-2xl flex items-center gap-4 mb-8 active:scale-95 transition-transform shadow-sm" onClick={() => {navigate('/account'); setIsMenuOpen(false);}}>
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-leaf-600 font-medium">View Dashboard</p>
                </div>
                <ChevronDown className="-rotate-90 text-leaf-400" size={20}/>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-8">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-gray-900 text-white py-3.5 rounded-xl font-bold text-center shadow-lg active:scale-95 transition">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="bg-white border border-gray-200 text-gray-900 py-3.5 rounded-xl font-bold text-center active:scale-95 transition">Sign Up</Link>
              </div>
            )}

            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-lg ${
                    location.pathname === link.path ? 'bg-gray-100 text-leaf-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="my-4 h-px bg-gray-100 w-full"></div>

              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 text-gray-600 font-bold transition-all">
                <Heart size={20} className="text-red-500"/> My Wishlist
              </Link>
              
              <button 
                onClick={() => { onOpenChef(); setIsMenuOpen(false); }} 
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-bold text-left transition-all border border-orange-100"
              >
                <ChefHat size={20}/> AI Smart Chef
              </button>
            </div>
          </div>

          {user && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <button onClick={() => {logout(); setIsMenuOpen(false);}} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-4 bg-white border border-red-100 rounded-2xl hover:bg-red-50 transition shadow-sm">
                <LogOut size={18}/> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
