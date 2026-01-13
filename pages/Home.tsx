
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Leaf, MapPin, Star, Sparkles, 
  Zap, Calendar, ChefHat, Play, ArrowUpRight, 
  Truck, ShieldCheck, Heart, Timer, Award, RotateCcw
} from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { TESTIMONIALS, BLOG_POSTS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { DailyRewards } from '../components/features/DailyRewards';

export const Home: React.FC = () => {
  const { products } = useProduct();
  const { user } = useAuth();
  const { orders } = useOrder();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  
  // Real countdown to midnight
  const calculateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    const diff = midnight.getTime() - now.getTime();
    
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Data selection
  const featuredProducts = useMemo(() => products.filter(p => p.isOrganic).slice(0, 4), [products]);
  const dealProduct = useMemo(() => products.find(p => p.price > 100 && p.oldPrice) || products[0], [products]);

  // Buy It Again Logic (Personalization)
  const previousItems = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const uniqueItemsMap = new Map();
    orders.flatMap(order => order.items).forEach(item => {
        if (!uniqueItemsMap.has(item.id)) {
            const currentProduct = products.find(p => p.id === item.id);
            if (currentProduct) uniqueItemsMap.set(item.id, currentProduct);
        }
    });
    
    return Array.from(uniqueItemsMap.values()).slice(0, 4);
  }, [orders, products]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parallax / Mouse Move Effect for Hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    // Throttle for performance could be added here, but direct update is smoother for desktop
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20; // -10 to 10
    const y = (clientY / window.innerHeight - 0.5) * 20; // -10 to 10
    setMousePos({ x, y });
  };

  return (
    <div className="w-full bg-[#FAFAF9] overflow-x-hidden font-sans text-slate-800" onMouseMove={handleMouseMove}>
      
      <DailyRewards />

      {/* 1. MODERN PARALLAX HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 lg:pt-0">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 bg-[#F3F4F6] -z-20"></div>
        <div 
            className="absolute top-[-20%] right-[-10%] w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-gradient-to-br from-leaf-300/20 to-yellow-200/20 rounded-full blur-[120px] transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
        ></div>
        <div 
            className="absolute bottom-[-10%] left-[-10%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-gradient-to-tr from-green-200/30 to-blue-100/30 rounded-full blur-[100px] transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-8 animate-in slide-in-from-left-10 duration-1000 fade-in order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/60 shadow-sm backdrop-blur-md hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-leaf-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">Live from Kolkata & Delhi Farms</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-gray-900 leading-[1] tracking-tight">
              Eat <span className="text-transparent bg-clip-text bg-gradient-to-br from-leaf-700 to-leaf-500 italic">Fresh.</span> <br />
              Live <span className="text-gray-400">Better.</span>
            </h1>
            
            <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
              Experience the crunch of produce harvested within 24 hours. No cold storage, just pure nature delivered to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop" className="group relative bg-gray-900 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 overflow-hidden shadow-2xl hover:shadow-leaf-500/40 transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-leaf-600 to-leaf-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">Start Shopping</span>
                <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform relative z-10"><ArrowRight size={16} /></div>
              </Link>
              <Link to="/about" className="group bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:border-leaf-300 hover:bg-leaf-50 hover:text-leaf-700 shadow-sm hover:shadow-lg">
                <Play className="fill-current group-hover:scale-110 transition-transform" size={16}/> How it Works
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-gray-200/60 max-w-lg">
                {[
                    { val: "15k+", label: "Happy Families" },
                    { val: "100%", label: "Organic Verified" },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-3xl font-black text-gray-900">{stat.val}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* Hero Visual - 3D Floating Element */}
          <div className="lg:col-span-6 relative h-[400px] lg:h-[800px] flex items-center justify-center perspective-1000 order-1 lg:order-2">
             <div 
                className="relative z-10 w-full max-w-lg transition-transform duration-100 ease-out"
                style={{ 
                    transform: `rotateY(${mousePos.x * 0.5}deg) rotateX(${mousePos.y * -0.5}deg)` 
                }}
             >
               {/* Background Circle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-gradient-to-b from-green-100 to-transparent rounded-full opacity-50 blur-3xl"></div>

               {/* Main Plate Image */}
               <img 
                 src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-shopping-basket-with-food-png-image_11959560.png" 
                 alt="Fresh Basket" 
                 className="w-full h-auto drop-shadow-2xl relative z-10 animate-float"
               />
               
               {/* Floating Glass Cards */}
               <div className="absolute top-0 right-0 lg:top-10 lg:right-0 bg-white/70 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/60 flex items-center gap-4 animate-in zoom-in [animation-delay:500ms] max-w-[180px] lg:max-w-[200px] hover:scale-110 transition-transform cursor-default transform translate-x-4 lg:translate-x-0">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200"><Leaf size={20}/></div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Pesticide Free</p>
                     <p className="text-sm font-bold text-gray-900 leading-tight">100% Verified</p>
                  </div>
               </div>
               
               <div className="absolute bottom-0 left-0 lg:bottom-20 lg:-left-6 bg-white/70 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/60 flex items-center gap-4 animate-in zoom-in [animation-delay:800ms] max-w-[180px] lg:max-w-[200px] hover:scale-110 transition-transform cursor-default transform -translate-x-4 lg:translate-x-0">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-yellow-200"><Award size={20}/></div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Quality</p>
                     <p className="text-sm font-bold text-gray-900 leading-tight">Premium Grade</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE MARKET TICKER */}
      <div className="bg-gray-900 text-white py-4 overflow-hidden relative z-20 transform -skew-y-1 origin-left shadow-2xl border-y border-gray-800">
         <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
            {[
                "Just Harvested: Spinach in Pune Farms",
                "Price Drop: Tomatoes down by 12% today",
                "Delivery slots for tomorrow filling fast",
                "Monsoon Special: Corn stocks replenished",
                "Fresh Apples from Shimla arrived at depot",
                "Just Harvested: Spinach in Pune Farms",
                "Price Drop: Tomatoes down by 12% today",
            ].map((text, i) => (
               <React.Fragment key={i}>
                  <span className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                     <Zap size={14} className="text-yellow-400 fill-current"/> {text}
                  </span>
                  <span className="text-gray-700 opacity-30 text-xl">•</span>
               </React.Fragment>
            ))}
         </div>
      </div>

      {/* 3. PERSONALIZATION: BUY IT AGAIN (Conditional) */}
      {previousItems.length > 0 && (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl"><RotateCcw size={24}/></div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">Buy It Again</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Based on your recent orders</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {previousItems.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* 4. SEASONAL HIGHLIGHT: NATURE'S SCHEDULE */}
      <section className="py-24 container mx-auto px-4">
         <div className="relative rounded-[3rem] p-1 overflow-hidden bg-gradient-to-br from-orange-300 via-yellow-200 to-green-300 shadow-2xl">
            <div className="bg-white/95 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-16 relative overflow-hidden h-full">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none"><Leaf size={400} /></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                   <div className="md:w-1/3 space-y-6">
                      <div className="inline-flex items-center gap-2 text-orange-700 bg-orange-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                         <Calendar size={14}/> In Season Now
                      </div>
                      <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 leading-tight">Nature's Schedule <br/> <span className="text-orange-600 italic">For You.</span></h2>
                      <p className="text-gray-600 text-lg leading-relaxed">Eating seasonal ensures maximum nutrition. Check out what's best to eat this month from our local partners.</p>
                      <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-gray-800 hover:scale-105 shadow-xl">
                         View Seasonal Catalog <ArrowRight size={18}/>
                      </Link>
                   </div>

                   <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      {[
                         { name: "Mango", img: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=300&q=80", status: "Peak" },
                         { name: "Watermelon", img: "https://res.cloudinary.com/dooyfg1pa/image/upload/v1766937877/erqv1dkc7dy1n1bjqkak.png?auto=format&fit=crop&w=300&q=80", status: "New" },
                         { name: "Lychee", img: "https://res.cloudinary.com/dooyfg1pa/image/upload/v1766937887/cksw3droojgm6uj3yicb.png?auto=format&fit=crop&w=300&q=80", status: "Ending" },
                         { name: "Okra", img: "https://images.unsplash.com/photo-1425543103986-226d3d8db61e?auto=format&fit=crop&w=300&q=80", status: "Steady" }
                      ].map((item, i) => (
                         <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-2" onClick={() => navigate(`/shop?q=${item.name}`)}>
                            <div className="h-28 flex items-center justify-center mb-4 overflow-hidden">
                               <img src={item.img} alt={item.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md mt-2 inline-block ${item.status === 'Peak' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {item.status} Season
                            </span>
                         </div>
                      ))}
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* 5. VALUE PROPS GRID */}
      <section className="py-12">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                  { icon: Truck, title: "Next Day Delivery", desc: "Order by 6 PM, get it by 10 AM tomorrow." },
                  { icon: ShieldCheck, title: "Quality Checked", desc: "Every item is handpicked and verified." },
                  { icon: Leaf, title: "100% Organic", desc: "Certified farms, zero chemical residue." },
                  { icon: Heart, title: "Fair Trade", desc: "Farmers get 30% more than market rates." },
               ].map((feat, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-gray-100 hover:border-leaf-200 hover:shadow-lg transition-all duration-300 group">
                     <div className="bg-leaf-50 p-4 rounded-2xl text-leaf-600 mb-6 group-hover:scale-110 transition-transform group-hover:bg-leaf-600 group-hover:text-white"><feat.icon size={28}/></div>
                     <h3 className="font-bold text-gray-900 text-lg mb-2">{feat.title}</h3>
                     <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. SHOP BY AISLE (Bento Grid) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-2 tracking-tight">Shop by Aisle</h2>
               <p className="text-gray-500 font-medium">Explore our widest range of premium harvest.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-gray-900 font-bold hover:text-leaf-600 transition bg-gray-50 px-6 py-3 rounded-full border border-gray-200 hover:border-leaf-300 group">
              View Full Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            {/* Main Featured Category - Fruits */}
            <Link to="/shop?category=Fruit" className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-[#FFF8F0] border border-orange-100">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <img src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80" alt="Fruits" className="absolute bottom-[-10%] right-[-10%] w-[80%] h-auto object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-2xl" />
                <div className="absolute top-10 left-10 z-10">
                   <span className="bg-white/80 backdrop-blur-md text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block shadow-sm border border-orange-100">Trending</span>
                   <h3 className="text-5xl font-serif font-medium text-gray-900 leading-[0.9]">Fresh <br/> Fruits</h3>
                   <div className="mt-8 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all shadow-lg group-hover:scale-110"><ArrowUpRight/></div>
                </div>
            </Link>

            {/* Veggies */}
            <Link to="/shop?category=Veg" className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-[#F0FDF4] border border-green-100">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-10"></div>
               <img src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80" alt="Veggies" className="absolute bottom-0 center w-full h-[60%] object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-3xl font-serif font-medium text-gray-900">Daily <br/> Veggies</h3>
                   <p className="text-sm text-green-700 mt-2 font-bold bg-green-200/50 px-2 py-1 rounded inline-block">Farm Essentials</p>
               </div>
            </Link>

            {/* Smaller Cats */}
            <Link to="/shop?category=Leafy" className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-emerald-50 hover:shadow-md transition-all border border-emerald-100">
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-2xl font-serif font-medium text-gray-900">Leafy <br/> Greens</h3>
               </div>
               <img src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80" alt="Leafy" className="absolute bottom-[-20%] right-[-20%] w-[90%] h-auto object-contain transition-transform duration-700 group-hover:scale-110" />
            </Link>

            <Link to="/shop?category=Exotic" className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-purple-50 hover:shadow-md transition-all border border-purple-100">
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-2xl font-serif font-medium text-gray-900">Exotic <br/> Finds</h3>
               </div>
               <img src="https://images.unsplash.com/photo-1596363820465-672723a3cb86?auto=format&fit=crop&w=400&q=80" alt="Exotic" className="absolute bottom-[-10%] right-[-10%] w-[80%] h-auto object-contain transition-transform duration-700 group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. BEST SELLERS CAROUSEL */}
      <section className="py-24 bg-[#FAFAF9]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
             <div className="max-w-xl">
               <span className="text-leaf-600 font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Customer Favorites</span>
               <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">Trending Harvests</h2>
             </div>
             <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-leaf-600 hover:text-white hover:border-leaf-600 transition flex items-center justify-center shadow-sm"><ArrowRight className="rotate-180" size={20}/></button>
                <button className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-leaf-600 hover:text-white hover:border-leaf-600 transition flex items-center justify-center shadow-sm"><ArrowRight size={20}/></button>
             </div>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[1,2,3,4].map(i => <ProductCardSkeleton key={i}/>)}
             </div>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
             </div>
          )}
        </div>
      </section>

      {/* 8. FLASH DEAL & FARMER STORY SPLIT */}
      <div className="container mx-auto px-4 py-10">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Flash Deal - Dark Theme */}
            {dealProduct && (
                <div className="bg-[#1a1a1a] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden flex flex-col justify-center min-h-[500px] shadow-2xl group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-leaf-600/20 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-6 animate-pulse shadow-lg shadow-red-500/30">
                            <Timer size={14} /> Flash Sale
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif font-medium mb-6 leading-tight">
                            {dealProduct.name.en} <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 italic">Limited Offer</span>
                        </h3>
                        <div className="flex gap-3 mb-10">
                            {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((t, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[80px] text-center">
                                    <div className="text-3xl font-black font-mono">{t.toString().padStart(2, '0')}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{['Hrs', 'Mins', 'Secs'][i]}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate(`/product/${dealProduct.id}`)} className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold hover:bg-gray-200 transition shadow-xl w-fit flex items-center gap-2 group-hover:gap-4">
                            Grab Deal Now <ArrowRight size={18}/>
                        </button>
                    </div>
                    <img 
                        src={dealProduct.image} 
                        alt={dealProduct.name.en} 
                        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-auto object-contain drop-shadow-2xl opacity-90 transform rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                    />
                </div>
            )}

            {/* Editorial Story - Light Theme */}
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 md:p-14 relative overflow-hidden flex flex-col justify-end min-h-[500px] group shadow-xl">
                <img 
                    src="https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=800&q=80" 
                    alt="Farmer" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.85] group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                
                <div className="relative z-10 text-white">
                    <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-yellow-400/20">
                       <Sparkles size={14}/> Farmer of the Month
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif font-medium mb-4 leading-tight">Meet Rajesh from <br/>Nashik Organic Farms</h3>
                    <div className="w-16 h-1 bg-yellow-400 rounded-full mb-6"></div>
                    <p className="text-gray-200 mb-8 line-clamp-2 text-lg font-medium">
                       "Growing organic isn't just a method, it's a responsibility. Every apple you buy supports my family and the earth."
                    </p>
                    <Link to="/about" className="inline-flex items-center gap-2 text-white font-bold hover:text-yellow-400 transition-colors uppercase tracking-widest text-sm group-hover:gap-4">
                        Read His Story <ArrowRight size={16}/>
                    </Link>
                </div>
            </div>
         </div>
      </div>

      {/* 9. CHEF'S CORNER (Blog) */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
               <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><ChefHat size={32}/></div>
               <h2 className="text-4xl font-serif font-medium text-gray-900 tracking-tight">In the Kitchen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {BLOG_POSTS.slice(0, 3).map((post, i) => (
                  <Link to={`/blog/${post.id}`} key={i} className="group cursor-pointer">
                     <div className="rounded-[2rem] overflow-hidden mb-6 relative aspect-[4/3] shadow-md group-hover:shadow-2xl transition-all duration-300">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                           {post.category}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 group-hover:text-leaf-600 transition-colors leading-tight mb-3 font-serif">
                        {post.title}
                     </h3>
                     <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* 10. TESTIMONIALS - Marquee Style */}
      <section className="py-24 bg-[#FAFAF9] overflow-hidden border-t border-gray-100">
         <div className="container mx-auto px-4 text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 tracking-tight">Love from the <span className="text-leaf-600 italic">Community</span></h2>
            <p className="text-gray-500 mt-4 text-lg">Join 15,000+ happy neighbors in West Bengal.</p>
         </div>

         <div className="relative w-full">
            <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                    <div key={i} className="min-w-[350px] md:min-w-[400px] bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex gap-1 text-yellow-400 mb-4">
                            {[1,2,3,4,5].map(star => <Star key={star} fill="currentColor" size={16}/>)}
                        </div>
                        <p className="text-gray-700 text-lg font-medium leading-relaxed italic mb-6 font-serif">"{t.comment}"</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">
                                {t.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{t.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-400 font-bold uppercase tracking-wide">
                                    <MapPin size={10}/> {t.location}
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
