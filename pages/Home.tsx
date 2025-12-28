
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Leaf, Clock, MapPin, Star, Sparkles, 
  CheckCircle, Zap, TrendingUp, Calendar, Heart, 
  ChefHat, Play, ArrowUpRight, Truck, ShieldCheck,
  Quote, Timer
} from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { useAuth } from '../services/AuthContext';
import { TESTIMONIALS, BLOG_POSTS } from '../constants';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

export const Home: React.FC = () => {
  const { products } = useProduct();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  // Data selection
  const featuredProducts = products.filter(p => p.isOrganic).slice(0, 4);
  const seasonalProducts = products.filter(p => p.category === 'Fruit').slice(0, 4);
  const dealProduct = products.find(p => p.price > 150) || products[0];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white overflow-x-hidden font-sans">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center bg-[#f8fafc] overflow-hidden pt-16 lg:pt-0">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-leaf-200/30 to-yellow-100/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-green-100/40 to-blue-50/40 rounded-full blur-[80px]"></div>

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-leaf-100 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">Delivering Fresh to Kolkata & Delhi</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-[0.95] tracking-tight">
              Nature's Best, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-leaf-400 relative">
                Delivered.
                <svg className="absolute w-full h-4 -bottom-1 left-0 text-leaf-200 -z-10 opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C2.00025 6.99997 64.9142 -1.54372 112.772 2.61864C160.629 6.781 197.832 2.05435 197.832 2.05435" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </h1>
            
            <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed font-medium">
              We bridge the gap between organic farms and your kitchen table. Experience the crunch of produce harvested within the last 24 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop" className="group bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-leaf-600 hover:scale-105 shadow-xl shadow-gray-900/20">
                Start Shopping <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform"><ArrowRight size={16} /></div>
              </Link>
              <Link to="/about" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:border-leaf-200 hover:bg-leaf-50 hover:text-leaf-700 shadow-sm hover:shadow-md">
                <Play className="fill-current" size={16}/> How it Works
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/60 max-w-lg">
                {[
                    { val: "15k+", label: "Happy Families" },
                    { val: "100%", label: "Organic Certified" },
                    { val: "24h", label: "Farm to Fork" },
                ].map((stat, i) => (
                    <div key={i}>
                        <div className="text-2xl font-extrabold text-gray-900">{stat.val}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>
          </div>

          {/* Hero Image / Visual */}
          <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] flex items-center justify-center">
             <div className="relative z-10 w-full max-w-md animate-float">
               {/* Main Plate Image */}
               <img 
                 src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-shopping-basket-with-food-png-image_11959560.png" 
                 alt="Fresh Basket" 
                 className="w-full h-auto drop-shadow-2xl relative z-10 transform -rotate-3 hover:rotate-0 transition duration-700 ease-out"
               />
               
               {/* Floating Glass Cards */}
               <div className="absolute top-0 -right-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 animate-in zoom-in [animation-delay:500ms] max-w-[200px]">
                  <div className="bg-green-100 p-3 rounded-full text-green-600"><Leaf size={20}/></div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">Pesticide Free</p>
                     <p className="text-sm font-bold text-gray-900 leading-tight">100% Verified</p>
                  </div>
               </div>
               
               <div className="absolute bottom-20 -left-10 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 animate-in zoom-in [animation-delay:800ms] max-w-[200px]">
                  <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Star size={20} fill="currentColor"/></div>
                  <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">Top Rated</p>
                     <p className="text-sm font-bold text-gray-900 leading-tight">4.9/5 Quality</p>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE HARVEST TICKER */}
      <div className="bg-gray-900 text-white py-3 overflow-hidden relative z-20 border-b border-gray-800">
         <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
            {[
                "🥬 Just Harvested: Spinach in Pune Farms",
                "🍅 Price Drop: Tomatoes down by 12% today",
                "🚚 Delivery slots for tomorrow filling fast",
                "🌧️ Monsoon Special: Corn stocks replenished",
                "🍎 Fresh Apples from Shimla arrived at depot",
            ].map((text, i) => (
               <React.Fragment key={i}>
                  <span className="flex items-center gap-2 text-sm font-medium tracking-wide">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> {text}
                  </span>
                  <span className="text-gray-700 mx-4">|</span>
               </React.Fragment>
            ))}
         </div>
      </div>

      {/* 3. SEASONAL CALENDAR WIDGET */}
      <section className="py-16 container mx-auto px-4">
         <div className="bg-gradient-to-r from-leaf-50 to-white border border-leaf-100 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10"><Leaf size={300} /></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
               <div className="md:w-1/3 space-y-4">
                  <div className="inline-flex items-center gap-2 text-leaf-700 bg-leaf-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                     <Calendar size={14}/> In Season Now
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What's Best to Eat this Month?</h2>
                  <p className="text-gray-600 text-lg">Nature has a schedule. Eating seasonal produce ensures maximum nutrition and flavor.</p>
                  <Link to="/shop" className="inline-flex items-center gap-2 text-leaf-700 font-bold border-b-2 border-leaf-200 hover:border-leaf-600 transition-colors pb-1">
                     View Seasonal Catalog <ArrowRight size={16}/>
                  </Link>
               </div>

               <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {[
                     { name: "Mango", img: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=300&q=80", status: "Peak Season" },
                     { name: "Watermelon", img: "https://res.cloudinary.com/dooyfg1pa/image/upload/v1766937877/erqv1dkc7dy1n1bjqkak.png?auto=format&fit=crop&w=300&q=80", status: "Starting" },
                     { name: "Lychee", img: "https://res.cloudinary.com/dooyfg1pa/image/upload/v1766937887/cksw3droojgm6uj3yicb.png?auto=format&fit=crop&w=300&q=80", status: "Ending Soon" },
                     { name: "Okra", img: "https://images.unsplash.com/photo-1425543103986-226d3d8db61e?auto=format&fit=crop&w=300&q=80", status: "Year Round" }
                  ].map((item, i) => (
                     <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/shop?q=${item.name}`)}>
                        <div className="h-24 flex items-center justify-center mb-3 overflow-hidden">
                           <img src={item.img} alt={item.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.status === 'Peak Season' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                           {item.status}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 4. VALUE PROPS */}
      <section className="py-12 bg-white">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { icon: Truck, title: "Next Day Delivery", desc: "Order by 6 PM, get it by 10 AM tomorrow." },
                  { icon: ShieldCheck, title: "Quality Checked", desc: "Every item is handpicked and verified." },
                  { icon: Leaf, title: "100% Organic", desc: "Certified farms, zero chemical residue." },
                  { icon: Heart, title: "Fair Trade", desc: "Farmers get 30% more than market rates." },
               ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-leaf-200 transition-colors">
                     <div className="bg-white p-3 rounded-xl shadow-sm text-leaf-600"><feat.icon size={24}/></div>
                     <div>
                        <h3 className="font-bold text-gray-900 text-lg">{feat.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{feat.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. SHOP BY AISLE (Bento Grid) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
               <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Shop by Aisle</h2>
               <p className="text-gray-500">Explore our widest range of premium harvest.</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-gray-900 font-bold hover:text-leaf-600 transition bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 group">
              View Full Catalog <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[280px]">
            {/* Main Featured Category */}
            <Link to="/shop?category=Fruit" className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100/50 transition-opacity opacity-50 group-hover:opacity-100"></div>
                <img src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80" alt="Fruits" className="absolute bottom-0 right-0 w-[80%] h-auto object-contain transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3" />
                <div className="absolute top-10 left-10 z-10">
                   <span className="bg-white/90 backdrop-blur-sm text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-sm">Best Season</span>
                   <h3 className="text-5xl font-extrabold text-gray-900 leading-[0.9]">Fresh <br/> Fruits</h3>
                   <div className="mt-8 w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-all shadow-lg"><ArrowUpRight/></div>
                </div>
            </Link>

            {/* Veggies */}
            <Link to="/shop?category=Veg" className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-white">
               <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100/50 transition-opacity opacity-50 group-hover:opacity-100"></div>
               <img src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80" alt="Veggies" className="absolute bottom-0 center w-full h-[60%] object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-3xl font-extrabold text-gray-900">Daily <br/> Veggies</h3>
                   <p className="text-sm text-gray-600 mt-2 font-medium">Farm fresh everyday</p>
               </div>
            </Link>

            {/* Smaller Cats */}
            <Link to="/shop?category=Leafy" className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-emerald-50 hover:shadow-md transition-shadow">
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-2xl font-extrabold text-gray-900">Leafy <br/> Greens</h3>
               </div>
               <img src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80" alt="Leafy" className="absolute bottom-[-20%] right-[-20%] w-[90%] h-auto object-contain transition-transform duration-700 group-hover:scale-110" />
            </Link>

            <Link to="/shop?category=Exotic" className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[2.5rem] shadow-sm bg-purple-50 hover:shadow-md transition-shadow">
               <div className="absolute top-8 left-8 z-10">
                   <h3 className="text-2xl font-extrabold text-gray-900">Exotic <br/> Finds</h3>
               </div>
               <img src="https://images.unsplash.com/photo-1596363820465-672723a3cb86?auto=format&fit=crop&w=400&q=80" alt="Exotic" className="absolute bottom-[-10%] right-[-10%] w-[80%] h-auto object-contain transition-transform duration-700 group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS CAROUSEL */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
             <div className="max-w-xl">
               <span className="text-leaf-600 font-bold text-sm uppercase tracking-widest mb-2 block">Customer Favorites</span>
               <h2 className="text-4xl font-extrabold text-gray-900">Trending Harvests</h2>
             </div>
             <div className="flex gap-2">
                <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition"><ArrowRight className="rotate-180" size={20}/></button>
                <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition"><ArrowRight size={20}/></button>
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

      {/* 7. FLASH DEAL & FARMER STORY SPLIT */}
      <div className="container mx-auto px-4 py-10">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Flash Deal */}
            {dealProduct && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-center min-h-[450px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
                            <Timer size={14} /> Flash Sale
                        </div>
                        <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                            {dealProduct.name.en} <br/> <span className="text-red-400">40% OFF</span>
                        </h3>
                        <div className="flex gap-3 mb-10">
                            {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((t, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-xl min-w-[70px] text-center">
                                    <div className="text-2xl font-bold font-mono">{t.toString().padStart(2, '0')}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{['Hrs', 'Mins', 'Secs'][i]}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate(`/product/${dealProduct.id}`)} className="bg-white text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg w-fit">
                            Grab Deal Now
                        </button>
                    </div>
                    <img 
                        src={dealProduct.image} 
                        alt={dealProduct.name.en} 
                        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-auto object-contain drop-shadow-2xl opacity-90 transform rotate-12"
                    />
                </div>
            )}

            {/* Editorial Story */}
            <div className="bg-leaf-50 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col justify-end min-h-[450px] group">
                <img 
                    src="https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=800&q=80" 
                    alt="Farmer" 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="relative z-10 text-white p-4">
                    <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                       <Sparkles size={14}/> Farmer of the Month
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">Meet Rajesh from <br/>Nashik Organic Farms</h3>
                    <p className="text-gray-200 mb-6 line-clamp-2">
                       "Growing organic isn't just a method, it's a responsibility. Every apple you buy supports my family."
                    </p>
                    <Link to="/about" className="text-white font-bold underline decoration-2 underline-offset-4 hover:text-yellow-400 transition-colors">
                        Read His Story
                    </Link>
                </div>
            </div>
         </div>
      </div>

      {/* 8. CHEF'S CORNER (Blog) */}
      <section className="py-20 bg-white">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-10">
               <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><ChefHat size={24}/></div>
               <h2 className="text-3xl font-extrabold text-gray-900">In the Kitchen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {BLOG_POSTS.slice(0, 3).map((post, i) => (
                  <Link to={`/blog/${post.id}`} key={i} className="group cursor-pointer">
                     <div className="rounded-3xl overflow-hidden mb-4 relative aspect-[4/3]">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                           {post.category}
                        </div>
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 group-hover:text-leaf-600 transition-colors leading-tight mb-2">
                        {post.title}
                     </h3>
                     <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-24 bg-[#f8fafc] overflow-hidden">
         <div className="container mx-auto px-4">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Love from the Community</h2>
               <p className="text-gray-500 mt-3 text-lg">Join thousands of happy neighbors in West Bengal.</p>
            </div>

            <div className="relative max-w-5xl mx-auto">
               <div className="absolute top-0 left-0 text-leaf-100 -translate-x-10 -translate-y-10"><Quote size={120} /></div>
               
               <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl relative z-10 border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                     <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
                        <div className="absolute inset-0 bg-leaf-200 rounded-full blur-xl opacity-50"></div>
                        <img 
                           src={`https://randomuser.me/api/portraits/women/${activeTestimonial + 45}.jpg`} 
                           className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg relative z-10" 
                           alt="User"
                        />
                     </div>
                     <div className="flex-grow text-center md:text-left">
                        <div className="flex justify-center md:justify-start text-yellow-400 mb-6 gap-1">
                           {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={24}/>)}
                        </div>
                        <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-8 italic">
                           "{TESTIMONIALS[activeTestimonial].comment}"
                        </p>
                        <div>
                           <h4 className="font-bold text-gray-900 text-xl">{TESTIMONIALS[activeTestimonial].name}</h4>
                           <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-gray-500 font-medium mt-1">
                              <MapPin size={14} className="text-leaf-500"/> {TESTIMONIALS[activeTestimonial].location}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Navigation Dots */}
               <div className="flex justify-center gap-3 mt-10">
                  {TESTIMONIALS.map((_, i) => (
                     <button 
                        key={i} 
                        onClick={() => setActiveTestimonial(i)}
                        className={`h-3 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'bg-leaf-600 w-10' : 'bg-gray-300 w-3 hover:bg-gray-400'}`}
                        aria-label={`Go to testimonial ${i + 1}`}
                     />
                  ))}
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};
