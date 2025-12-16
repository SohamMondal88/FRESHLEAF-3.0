import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Clock, MapPin, Star, PlayCircle, Leaf, Sparkles, Heart, Search, Timer, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { TESTIMONIALS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';

export const Home: React.FC = () => {
  const { products } = useProduct();
  const navigate = useNavigate();
  const featuredProducts = products.slice(0, 8); // Show more products
  const dealProduct = products.find(p => p.category === 'Exotic' || p.price > 100) || products[0];

  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Categories Data
  const categories = [
    { name: 'Fresh Fruits', count: '45+ Items', img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80', color: 'bg-orange-50', link: 'Fruit' },
    { name: 'Organic Veggies', count: '60+ Items', img: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80', color: 'bg-green-50', link: 'Veg' },
    { name: 'Leafy Greens', count: '20+ Items', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', color: 'bg-emerald-50', link: 'Leafy' },
    { name: 'Root Vegetables', count: '15+ Items', img: 'https://images.unsplash.com/photo-1590623359560-59f6be2b6510?auto=format&fit=crop&w=400&q=80', color: 'bg-yellow-50', link: 'Root' },
    { name: 'Exotic Finds', count: '12+ Items', img: 'https://images.unsplash.com/photo-1596363820465-672723a3cb86?auto=format&fit=crop&w=400&q=80', color: 'bg-purple-50', link: 'Exotic' },
    { name: 'Summer Special', count: 'Limited', img: 'https://images.unsplash.com/photo-1596363820253-b90343a42929?auto=format&fit=crop&w=400&q=80', color: 'bg-red-50', link: 'Fruit' },
  ];

  const features = [
    { title: 'Fresh from Farm', desc: 'Harvested within 24hrs', icon: Leaf, bg: 'bg-green-100', text: 'text-green-600' },
    { title: 'Free Delivery', desc: 'On orders above ₹499', icon: Truck, bg: 'bg-blue-100', text: 'text-blue-600' },
    { title: 'Secure Payment', desc: '100% Safe Transaction', icon: ShieldCheck, bg: 'bg-purple-100', text: 'text-purple-600' },
    { title: 'Quality Check', desc: 'Handpicked & Sorted', icon: Sparkles, bg: 'bg-orange-100', text: 'text-orange-600' },
  ];

  return (
    <div className="w-full bg-white overflow-x-hidden">
      
      {/* 1. ANIMATED HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f0fdf4] via-white to-[#e0f2fe] overflow-hidden pt-16 md:pt-0">
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-l from-green-200/40 to-transparent rounded-bl-[10rem] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-gradient-to-t from-yellow-200/30 to-transparent rounded-tr-[10rem] pointer-events-none" />
        
        {/* Floating Elements (Background) */}
        <img src="https://cdn-icons-png.flaticon.com/512/1135/1135543.png" className="absolute top-[10%] left-[10%] w-12 h-12 opacity-40 animate-float delay-100 pointer-events-none" alt="" />
        <img src="https://cdn-icons-png.flaticon.com/512/2909/2909808.png" className="absolute bottom-[20%] right-[10%] w-16 h-16 opacity-40 animate-float delay-300 pointer-events-none" alt="" />
        <img src="https://cdn-icons-png.flaticon.com/512/415/415733.png" className="absolute top-[20%] right-[30%] w-10 h-10 opacity-30 animate-float delay-500 pointer-events-none" alt="" />

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left animate-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-leaf-200 shadow-sm mx-auto lg:mx-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-extrabold text-leaf-700 tracking-wide uppercase">100% Organic & Pesticide Free</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Eat <span className="text-leaf-600 relative">
                Fresh
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
              </span>
              <br /> Stay Healthy
            </h1>
            
            <p className="text-gray-600 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Experience the true taste of nature. Farm-fresh vegetables and sweet fruits delivered directly to your kitchen within 24 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link to="/shop" className="bg-leaf-600 hover:bg-leaf-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-leaf-500/30 hover:scale-105 active:scale-95">
                <ShoppingBag size={20} /> Shop Now
              </Link>
              <Link to="/about" className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:border-leaf-300 hover:text-leaf-600">
                <PlayCircle size={20} /> Watch Video
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-leaf-200/50">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i * 10}.jpg`} alt="" />
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  <p className="text-xs font-bold text-gray-500">12k+ Reviews</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Visual */}
          <div className="order-1 lg:order-2 relative h-[500px] flex items-center justify-center">
             {/* Background Circle */}
             <div className="absolute inset-0 bg-gradient-to-tr from-green-200 to-yellow-100 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '4s' }}></div>
             
             {/* Main Image Container */}
             <div className="relative z-10 w-full max-w-md animate-float">
               <img 
                 src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
                 alt="Grocery Basket" 
                 className="w-full h-auto rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition duration-700"
               />
               
               {/* Floating Cards */}
               <div className="absolute -left-6 top-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-float delay-200">
                 <div className="flex items-center gap-3">
                   <div className="bg-green-100 p-2.5 rounded-full text-green-600"><Leaf size={24} /></div>
                   <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Freshness</p>
                     <p className="text-sm font-extrabold text-gray-900">100% Guaranteed</p>
                   </div>
                 </div>
               </div>
               
               <div className="absolute -right-4 bottom-16 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-float delay-500">
                 <div className="flex items-center gap-3">
                   <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><Clock size={24} /></div>
                   <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Delivery</p>
                     <p className="text-sm font-extrabold text-gray-900">Under 30 Mins</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <div className="bg-leaf-900 py-3 overflow-hidden border-y border-leaf-800">
        <div className="animate-marquee flex gap-8 items-center text-white/90 text-sm font-bold tracking-widest uppercase">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <span>Organic Produce</span>
              <span className="text-leaf-500">•</span>
              <span>Farm Fresh</span>
              <span className="text-leaf-500">•</span>
              <span>Fast Delivery</span>
              <span className="text-leaf-500">•</span>
              <span>Best Prices</span>
              <span className="text-leaf-500">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. FEATURES GRID */}
      <section className="py-16 container mx-auto px-4">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, idx) => (
               <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 group text-center md:text-left">
                  <div className={`${feature.bg} ${feature.text} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto md:mx-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{feature.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="py-12 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-leaf-600 font-bold tracking-wider uppercase text-xs">Browse Collections</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Shop by Category</h2>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-gray-900 font-bold hover:text-leaf-600 transition bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/shop?q=${cat.link}`} 
                className={`relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-lg transition-all duration-300 ${cat.color}`}
              >
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                   <div>
                     <h3 className="font-bold text-gray-900 leading-tight group-hover:text-leaf-700 transition">{cat.name}</h3>
                     <p className="text-[10px] font-bold text-gray-500 mt-1">{cat.count}</p>
                   </div>
                   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                     <ArrowRight size={14} className="text-gray-900" />
                   </div>
                </div>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="absolute bottom-0 right-0 w-[80%] h-[60%] object-cover rounded-tl-3xl shadow-sm transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link to="/shop" className="inline-flex items-center gap-2 text-white bg-gray-900 font-bold hover:bg-leaf-600 transition px-6 py-3 rounded-xl shadow-lg">
              View All Categories <ArrowRight size={18} />
             </Link>
          </div>
        </div>
      </section>

      {/* 5. DEAL OF THE DAY BANNER */}
      {dealProduct && (
        <section className="py-20 container mx-auto px-4">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden text-white shadow-2xl">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-leaf-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Timer size={14} /> Deal of the Day
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-400 to-yellow-300">Flash Sale!</span><br/>
                  {dealProduct.name.en}
                </h2>
                <p className="text-gray-300 text-lg max-w-md">
                  Get the freshest {dealProduct.name.en.toLowerCase()} at an unbeatable price. Hurry, offer ends soon!
                </p>
                
                {/* Countdown Timer */}
                <div className="flex gap-4">
                  {[
                    { val: timeLeft.hours, label: 'Hours' }, 
                    { val: timeLeft.minutes, label: 'Mins' }, 
                    { val: timeLeft.seconds, label: 'Secs' }
                  ].map((t, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 min-w-[70px] text-center">
                      <div className="text-2xl font-bold font-mono">{t.val.toString().padStart(2, '0')}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                   <div className="text-4xl font-extrabold text-yellow-400">₹{Math.floor(dealProduct.price * 0.8)} <span className="text-lg text-gray-500 line-through font-medium">₹{dealProduct.price}</span></div>
                   <button onClick={() => navigate(`/product/${dealProduct.id}`)} className="bg-white text-gray-900 hover:bg-leaf-400 hover:text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg transform hover:-translate-y-1">
                     Grab Deal
                   </button>
                </div>
              </div>

              <div className="md:w-1/2 relative flex justify-center">
                 <div className="relative w-80 h-80 md:w-96 md:h-96">
                    <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-spin-slow"></div>
                    <img 
                      src={dealProduct.image} 
                      alt={dealProduct.name.en} 
                      className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] object-cover rounded-full shadow-2xl border-4 border-white/10"
                    />
                    <div className="absolute -bottom-4 right-10 bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shadow-lg animate-bounce transform rotate-12 border-4 border-white">
                      -20%
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. BEST SELLERS GRID */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Best Sellers</h2>
             <p className="text-gray-500">Customers love these! Handpicked daily essentials that fly off the shelves.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/shop" className="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-3 rounded-full font-bold transition-all duration-300">
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS (CAROUSEL STYLE) */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div className="max-w-xl">
               <span className="text-leaf-600 font-bold tracking-wider uppercase text-xs mb-2 block">Testimonials</span>
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-leaf-600 hover:text-white transition"><ArrowLeft size={18} className="rotate-180" /></button>
                <button className="w-10 h-10 rounded-full bg-leaf-600 text-white flex items-center justify-center hover:bg-leaf-700 transition"><ArrowRight size={18} /></button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-8 right-8 text-leaf-100 group-hover:text-leaf-200 transition-colors">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < t.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed relative z-10">"{t.comment}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-leaf-400 to-leaf-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <MapPin size={10} /> {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};