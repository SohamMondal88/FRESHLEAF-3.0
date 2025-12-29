
import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, User, Search, Leaf, Phone, MapPin, 
  Facebook, Twitter, Instagram, Linkedin, Youtube, LogOut, Crown, ChevronRight, 
  Mail, ShoppingBag, Mic, Sprout, ArrowRight, Heart, 
  Package, LogIn, UserPlus, LayoutDashboard, Navigation, Lock
} from 'lucide-react';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useProduct } from '../services/ProductContext';
import { usePincode } from '../services/PincodeContext';
import { ChatBot } from './ChatBot';
import { BackToTop } from './BackToTop';
import { Product } from '../types';

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Contexts
  const { cartItems, wishlist } = useCart();
  const { user, logout } = useAuth();
  const { products } = useProduct();
  const { pincode, setPincode, isServiceable, showModal, setShowModal } = usePincode();
  const location = useLocation();
  const navigate = useNavigate();

  // Pincode Input State
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [micPermission, setMicPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [locPermission, setLocPermission] = useState<'default' | 'granted' | 'denied'>('default');

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowSuggestions(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isMenuOpen]);

  // Fuzzy Search Implementation
  const fuzzyMatch = (text: string, search: string) => {
    const cleanText = text.toLowerCase().replace(/\s/g, '');
    const cleanSearch = search.toLowerCase().replace(/\s/g, '');
    return cleanText.includes(cleanSearch);
  };

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const matches = products.filter(p => 
        fuzzyMatch(p.name.en, searchTerm) || 
        fuzzyMatch(p.category, searchTerm) ||
        p.name.hi.includes(searchTerm) || 
        p.name.bn.includes(searchTerm)
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
    } catch (err) {
      setMicPermission('denied');
      alert("Microphone access denied. Voice search will be unavailable.");
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocPermission('granted');
          // Demo: If location is found, autofill a valid pincode for UX
          setPincodeInput('743301'); 
        },
        (error) => {
          setLocPermission('denied');
          alert("Location access denied. Please enter pincode manually.");
        }
      );
    }
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        navigate(`/shop?q=${encodeURIComponent(transcript)}`);
        setShowSuggestions(false);
        setIsListening(false);
        if (isMenuOpen) setIsMenuOpen(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      requestMicPermission(); // Try asking for permission if not working
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
    }
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate client side quickly before async check
    if (!/^(7433\d{2})$/.test(pincodeInput)) {
        setPincodeError("We only deliver to pincodes starting with 7433XX");
        return;
    }
    
    setPincodeLoading(true);
    setPincodeError('');
    const success = await setPincode(pincodeInput);
    setPincodeLoading(false);
    if (!success) {
        setPincodeError("Sorry, we do not deliver to this location yet.");
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
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-gray-50/30">
      
      {/* Enhanced Welcome & Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
            
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border border-white/50 animate-in zoom-in-95 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-leaf-400/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                {!isServiceable && (
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={20}/></button>
                )}
                
                <div className="text-center mb-8 relative z-10">
                    <div className="bg-gradient-to-br from-leaf-500 to-leaf-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-leaf-200 rotate-3">
                        <Leaf size={40} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome to FreshLeaf</h3>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Set up your experience to get started.</p>
                </div>

                {/* Permission Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    <button 
                        onClick={requestLocationPermission}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${locPermission === 'granted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-100 hover:border-leaf-300 hover:shadow-md'}`}
                    >
                        {locPermission === 'granted' ? <MapPin size={24} className="mb-2"/> : <Navigation size={24} className="mb-2 text-blue-500"/>}
                        <span className="text-xs font-bold">{locPermission === 'granted' ? 'Locating...' : 'Allow Location'}</span>
                    </button>
                    <button 
                        onClick={requestMicPermission}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${micPermission === 'granted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-100 hover:border-leaf-300 hover:shadow-md'}`}
                    >
                        <Mic size={24} className={`mb-2 ${micPermission === 'granted' ? '' : 'text-red-500'}`}/>
                        <span className="text-xs font-bold">{micPermission === 'granted' ? 'Voice Active' : 'Allow Voice'}</span>
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400 bg-transparent"><span className="bg-white/50 px-2 backdrop-blur-sm">Or Enter Manually</span></div>
                </div>

                <form onSubmit={handlePincodeSubmit} className="relative z-10">
                    <div className="relative mb-4">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            maxLength={6}
                            placeholder="Enter Pincode (7433XX)"
                            value={pincodeInput}
                            onChange={(e) => setPincodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center text-lg font-bold tracking-widest border border-gray-200 bg-white/80 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition shadow-sm placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                        />
                    </div>
                    {pincodeError && <div className="text-red-500 text-xs text-center mb-4 font-bold bg-red-50 py-2 rounded-lg">{pincodeError}</div>}
                    <button 
                        type="submit" 
                        disabled={pincodeLoading || pincodeInput.length !== 6}
                        className="w-full bg-gray-900 hover:bg-leaf-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-leaf-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {pincodeLoading ? 'Verifying...' : 'Check Availability'} <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-leaf-900 text-white py-2 px-4 text-[11px] md:text-xs font-medium tracking-wide relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 hover:text-leaf-300 transition-colors">
              <MapPin size={12} className={isServiceable ? "text-green-400" : "text-gray-400"} /> 
              {pincode ? `Delivering to ${pincode}` : "Select Location"}
            </button>
            <span className="hidden sm:flex items-center gap-1.5 text-white/80">
              <Phone size={12} /> +91 98765 43210
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/seller" className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors">
               <Sprout size={12} /> Become a Seller
            </Link>
            <div className="w-px h-3 bg-white/20 hidden sm:block"></div>
            {user?.isPro ? (
              <span className="flex items-center gap-1.5 text-yellow-400 font-bold bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                <Crown size={12} fill="currentColor" /> Pro Member
              </span>
            ) : (
              <Link to="/subscription" className="hover:text-yellow-300 transition-colors text-white/90 flex items-center gap-1 group">
                Join Pro <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            <div className="w-px h-3 bg-white/20 hidden sm:block"></div>
            <Link to="/orders" className="hover:text-white transition-colors text-white/90 hidden sm:block">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav 
        className={`sticky top-0 z-40 transition-all duration-300 w-full border-b ${
          isScrolled 
            ? 'bg-white/85 backdrop-blur-md border-gray-200/50 shadow-soft py-3' 
            : 'bg-white border-gray-100 py-4 lg:py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="bg-gradient-to-br from-leaf-500 to-leaf-600 p-2 rounded-xl text-white shadow-lg shadow-leaf-200 group-hover:scale-105 transition-transform duration-300">
                <Leaf size={24} fill="currentColor" className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold text-gray-800 leading-none tracking-tight group-hover:text-leaf-600 transition-colors">
                  Fresh<span className="text-leaf-600">Leaf</span>
                </h1>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] ml-0.5">Organic</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1 rounded-full border border-gray-100/50">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    location.pathname === link.path 
                      ? 'bg-white text-leaf-700 shadow-sm' 
                      : 'text-gray-500 hover:text-leaf-600 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div ref={searchRef} className="hidden md:block relative w-full max-w-[240px] xl:max-w-xs group z-50">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.length > 1) setShowSuggestions(true); }}
                  placeholder={isListening ? "Listening..." : "Search products..."} 
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-100/80 border-transparent border-2 rounded-full focus:bg-white focus:border-leaf-500/30 focus:ring-4 focus:ring-leaf-500/10 transition-all outline-none text-sm placeholder-gray-400 ${isListening ? 'ring-4 ring-red-100 border-red-200 bg-white placeholder-red-400' : ''}`}
                />
                <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500' : 'text-gray-400 group-focus-within:text-leaf-600'}`} />
                <button 
                  type="button" 
                  onClick={startVoiceSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'text-gray-400 hover:text-leaf-600 hover:bg-gray-200'}`}
                >
                  <Mic size={16} />
                </button>
              </form>
              
              {showSuggestions && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {suggestions.length > 0 ? (
                    <>
                      <ul className="py-2">
                        {suggestions.map((product) => (
                          <li key={product.id}>
                            <button 
                              onClick={() => { navigate(`/product/${product.id}`); setShowSuggestions(false); setSearchTerm(''); }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                            >
                              <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{product.name.en}</p>
                                <p className="text-xs text-gray-500 truncate">{product.category}</p>
                              </div>
                              <span className="text-xs font-bold text-leaf-700">₹{product.price}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No products found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:block">
                 {user ? (
                  <Link to={user.role === 'seller' ? '/seller/dashboard' : '/account'} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-100 hover:border-leaf-200 hover:bg-leaf-50/50 transition-all group">
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-leaf-700 max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-leaf-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <User size={20} /> <span className="hidden xl:inline">Login</span>
                  </Link>
                )}
              </div>

              <Link to="/wishlist" className="relative group p-2.5 rounded-full bg-gray-100/80 text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all">
                <Heart size={22} className="group-hover:scale-110 transition-transform"/>
                {wishlist.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </Link>

              <Link to="/cart" className="relative group">
                <div className="p-2.5 rounded-full bg-gray-100/80 text-gray-700 group-hover:bg-leaf-500 group-hover:text-white transition-all duration-300">
                  <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Menu Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          
          {/* Header / User Profile */}
          <div className="bg-gradient-to-br from-leaf-800 to-leaf-600 p-6 text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>

              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                          <Leaf size={24} className="text-white" />
                      </div>
                      <button onClick={() => setIsMenuOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                          <X size={20} />
                      </button>
                  </div>

                  {user ? (
                      <div className="flex items-center gap-4" onClick={() => { navigate('/account'); setIsMenuOpen(false); }}>
                          <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full border-2 border-white/50 object-cover bg-white" />
                          <div>
                              <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
                              <p className="text-leaf-100 text-xs">{user.email}</p>
                              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  View Profile <ChevronRight size={10} />
                              </span>
                          </div>
                      </div>
                  ) : (
                      <div>
                          <h3 className="text-2xl font-bold mb-1">Welcome!</h3>
                          <p className="text-leaf-100 text-sm mb-4">Login to access your orders & offers.</p>
                          <div className="flex gap-3">
                              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 bg-white text-leaf-800 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-gray-50 transition">
                                  <LogIn size={16} /> Login
                              </Link>
                              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 bg-leaf-900/30 border border-white/30 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-leaf-900/50 transition">
                                  <UserPlus size={16} /> Sign Up
                              </Link>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-grow overflow-y-auto p-4 space-y-6">

              {/* Quick Links Grid */}
              <div className="grid grid-cols-2 gap-3">
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-leaf-50 hover:border-leaf-200 transition group shadow-sm">
                      <Package size={24} className="text-leaf-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-gray-700">My Orders</span>
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition group shadow-sm">
                      <Heart size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-gray-700">Wishlist</span>
                  </Link>
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition group shadow-sm">
                      <div className="relative">
                          <ShoppingBag size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
                          {totalItems > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
                      </div>
                      <span className="text-xs font-bold text-gray-700">Cart ({totalItems})</span>
                  </Link>
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-200 transition group shadow-sm">
                      <LayoutDashboard size={24} className="text-orange-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-gray-700">Explore</span>
                  </Link>
              </div>

              {/* Categories */}
              <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Shop By Category</h4>
                  <div className="space-y-1">
                      {[
                          { name: 'Fresh Fruits', icon: '🍎', path: '/shop?category=Fruit' },
                          { name: 'Daily Vegetables', icon: '🥦', path: '/shop?category=Veg' },
                          { name: 'Leafy Greens', icon: '🥬', path: '/shop?category=Leafy' },
                          { name: 'Exotic & Imported', icon: '🥑', path: '/shop?category=Exotic' },
                      ].map((cat, i) => (
                          <Link
                              key={i}
                              to={cat.path}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition active:scale-95 group"
                          >
                              <span className="text-xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-white group-hover:shadow-sm transition">{cat.icon}</span>
                              <span className="font-bold text-gray-700 text-sm flex-grow">{cat.name}</span>
                              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                          </Link>
                      ))}
                  </div>
              </div>

              {/* Main Nav Links */}
              <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Menu</h4>
                  <div className="space-y-1">
                      {navLinks.map((link) => (
                          <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center gap-3 p-3 rounded-xl transition font-medium ${location.pathname === link.path ? 'bg-leaf-50 text-leaf-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                              <span className="text-sm">{link.name}</span>
                          </Link>
                      ))}
                      <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium">
                          <span className="text-sm">Help Center</span>
                      </Link>
                  </div>
              </div>

              {/* Seller CTA */}
              <Link to="/seller" onClick={() => setIsMenuOpen(false)} className="block bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
                  <div className="relative z-10 flex items-center justify-between">
                      <div>
                          <h4 className="font-bold text-lg mb-1">Become a Seller</h4>
                          <p className="text-xs text-white/90">Sell produce directly to customers</p>
                      </div>
                      <div className="bg-white/20 p-2 rounded-full"><Sprout size={20} /></div>
                  </div>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-center gap-6 mb-4">
                  <a href="#" className="text-gray-400 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-full"><Facebook size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition p-2 hover:bg-blue-50 rounded-full"><Twitter size={20} /></a>
                  <a href="#" className="text-gray-400 hover:text-pink-600 transition p-2 hover:bg-pink-50 rounded-full"><Instagram size={20} /></a>
              </div>
              {user && (
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm py-2.5 rounded-xl hover:bg-red-50 transition border border-transparent hover:border-red-100">
                      <LogOut size={16} /> Sign Out
                  </button>
              )}
              <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">v2.4.0 • © 2024 FreshLeaf Technologies</p>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>

      <ChatBot />
      <BackToTop />
      
      {/* Enhanced Responsive Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 font-sans mt-20 relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
               {/* Brand & Socials */}
               <div className="space-y-6">
                  <div className="flex items-center gap-2">
                     <div className="bg-leaf-500 p-2 rounded-xl text-white">
                        <Leaf size={24} fill="currentColor" />
                     </div>
                     <h2 className="text-2xl font-extrabold tracking-tight">FreshLeaf</h2>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     FreshLeaf connects local farmers directly to your kitchen. We ensure the freshest organic produce is delivered to your doorstep within 24 hours of harvest.
                  </p>
                  <div className="flex gap-4">
                     {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, idx) => (
                        <a key={idx} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-leaf-600 hover:text-white hover:scale-110 transition-all duration-300">
                           <Icon size={18} />
                        </a>
                     ))}
                  </div>
               </div>

               {/* Quick Links */}
               <div>
                  <h3 className="font-bold text-lg mb-6">Quick Links</h3>
                  <ul className="space-y-3 text-sm text-gray-400">
                     <li><Link to="/home" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Home</Link></li>
                     <li><Link to="/shop" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Shop Now</Link></li>
                     <li><Link to="/about" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Our Story</Link></li>
                     <li><Link to="/blog" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Fresh Blog</Link></li>
                     <li><Link to="/contact" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Contact Us</Link></li>
                  </ul>
               </div>

               {/* My Account & Support */}
               <div>
                  <h3 className="font-bold text-lg mb-6">My Account</h3>
                  <ul className="space-y-3 text-sm text-gray-400">
                     {!user ? (
                        <>
                           <li><Link to="/login" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Login</Link></li>
                           <li><Link to="/signup" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Register</Link></li>
                        </>
                     ) : (
                        <>
                           <li><Link to="/account" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Dashboard</Link></li>
                           <li><Link to="/orders" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> My Orders</Link></li>
                        </>
                     )}
                     <li><Link to="/wishlist" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Wishlist</Link></li>
                     <li><Link to="/shipping-policy" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Shipping Policy</Link></li>
                     <li><Link to="/refund-policy" className="hover:text-leaf-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Returns & Refunds</Link></li>
                  </ul>
               </div>

               {/* Newsletter & Contact */}
               <div>
                  <h3 className="font-bold text-lg mb-6">Stay Connected</h3>
                  <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive deals and organic farming tips.</p>
                  <div className="flex gap-2 mb-6">
                     <input type="email" placeholder="Your Email" className="bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg text-sm w-full focus:outline-none focus:border-leaf-500" />
                     <button className="bg-leaf-600 hover:bg-leaf-700 px-4 py-2.5 rounded-lg text-white transition-colors">
                        <ArrowRight size={18} />
                     </button>
                  </div>
                  <div className="text-sm text-gray-400 space-y-2">
                     <p className="flex items-center gap-2"><Phone size={16} className="text-leaf-500"/> +91 98765 43210</p>
                     <p className="flex items-center gap-2"><Mail size={16} className="text-leaf-500"/> support@freshleaf.in</p>
                     <p className="flex items-start gap-2"><MapPin size={16} className="text-leaf-500 mt-1"/> 123 Green Market, Sector 4,<br/>Kolkata, West Bengal 700091</p>
                  </div>
               </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-500 text-sm">© {new Date().getFullYear()} FreshLeaf Technologies Pvt Ltd. All rights reserved.</p>
               <div className="flex gap-6 text-sm text-gray-500">
                  <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                  <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
