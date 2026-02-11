
import React, { useMemo, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Target, Users, Heart, Clock, ArrowRight, User, Globe, MessageCircle, ChevronDown } from 'lucide-react';
import { useOrder } from '../services/OrderContext';
import { useFarmer } from '../services/FarmerContext';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { db } from '../services/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

// --- ABOUT PAGE ---
export const About: React.FC = () => {
  const { orders } = useOrder();
  const { farmers } = useFarmer();

  // Dynamic calculations for "Realtime" stats
  const stats = useMemo(() => {
    return {
      orders: new Intl.NumberFormat('en-IN').format(orders.length),
      areas: farmers.length
    };
  }, [farmers.length, orders.length]);

  return (
    <div className="bg-white font-sans overflow-hidden">
      {/* Hero Parallax */}
      <div className="relative py-32 lg:py-48 bg-leaf-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-leaf-900/90 via-leaf-900/80 to-leaf-900"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-leaf-300 font-bold tracking-widest uppercase text-xs mb-6 backdrop-blur-md">Our Story</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
            Rooted in <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-300">Goodness</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Bridging the gap between hard-working Indian farmers and health-conscious families, delivering nature's best within hours of harvest.
          </p>
        </div>
      </div>

      {/* Mission Grid - Floating Cards */}
      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: "Our Mission", desc: "Eliminate middlemen to ensure fair pricing for farmers and fresher produce for you.", color: "text-red-500", bg: "bg-red-50" },
            { icon: Users, title: "Our Community", desc: "Partnering with certified organic farmers across India.", color: "text-blue-500", bg: "bg-blue-50" },
            { icon: Heart, title: "Our Promise", desc: "Farm-to-Fork in 24 Hours. If it's not fresh, we won't deliver it.", color: "text-green-500", bg: "bg-green-50" }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 hover:-translate-y-2 transition-all duration-300 group">
               <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                 <item.icon size={32} className={item.color} />
               </div>
               <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{item.title}</h3>
               <p className="text-gray-500 leading-relaxed text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
               <div className="absolute inset-0 bg-leaf-200 rounded-[3rem] rotate-3 transform scale-105 opacity-50"></div>
               <img src="https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=1200&q=80" alt="Farmer" className="relative z-10 rounded-[3rem] shadow-2xl w-full object-cover" />
            </div>
            <div className="lg:w-1/2 space-y-8">
               <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">Empowering <br/> Rural India</h2>
               <p className="text-gray-600 text-lg leading-relaxed">
                 FreshLeaf isn't just a store; it's a movement. By removing intermediaries, we help farmers earn fair prices. Every purchase you make contributes to a sustainable agricultural ecosystem.
               </p>
               
               <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-4xl md:text-5xl font-black text-leaf-600 mb-2">{stats.orders}+</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Orders Placed</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-4xl md:text-5xl font-black text-leaf-600 mb-2">{stats.areas}</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Partner Farms</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CONTACT PAGE ---
export const Contact: React.FC = () => (
  <div className="min-h-screen bg-gray-50 relative font-sans overflow-hidden">
    {/* Map Background Placeholder */}
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/city-fields.png")' }}></div>
    
    <div className="container mx-auto px-4 py-20 relative z-10">
      <div className="text-center mb-16 animate-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Get in Touch</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">We'd love to hear from you. Questions, feedback, or partnership ideas - we're all ears.</p>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in duration-700 delay-100">
        
        {/* Info Side (Dark) */}
        <div className="lg:w-2/5 bg-gray-900 text-white p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-leaf-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Contact Info</h2>
            <p className="text-gray-400 mb-12">Our team is available Mon-Sat, 9am - 7pm.</p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-leaf-500 transition-colors duration-300"><Phone size={20} className="text-white"/></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Call Us</h4>
                  <p className="text-gray-300">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-leaf-500 transition-colors duration-300"><Mail size={20} className="text-white"/></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email Us</h4>
                  <p className="text-gray-300">support@freshleaf.in</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-leaf-500 transition-colors duration-300"><MapPin size={20} className="text-white"/></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Visit HQ</h4>
                  <p className="text-gray-300 leading-relaxed">123 Green Market, Sector 4,<br/>New Delhi, India 110001</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-12 pt-12 border-t border-gray-800">
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-leaf-500 transition cursor-pointer flex items-center justify-center"><Globe size={18}/></div>
                <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-leaf-500 transition cursor-pointer flex items-center justify-center"><MessageCircle size={18}/></div>
             </div>
          </div>
        </div>

        {/* Form Side (Light) */}
        <div className="lg:w-3/5 p-12 lg:p-16 bg-white">
          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 group-focus-within:text-leaf-600 transition-colors">First Name</label>
                <input type="text" className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:border-leaf-600 focus:bg-white transition-colors" placeholder="John" />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 group-focus-within:text-leaf-600 transition-colors">Last Name</label>
                <input type="text" className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:border-leaf-600 focus:bg-white transition-colors" placeholder="Doe" />
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 group-focus-within:text-leaf-600 transition-colors">Email Address</label>
              <input type="email" className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:border-leaf-600 focus:bg-white transition-colors" placeholder="john@example.com" />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 group-focus-within:text-leaf-600 transition-colors">Message</label>
              <textarea rows={4} className="w-full bg-gray-50 border-b-2 border-gray-200 px-4 py-3 text-lg font-medium focus:outline-none focus:border-leaf-600 focus:bg-white transition-colors resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button className="bg-gray-900 hover:bg-leaf-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-leaf-200 transition-all flex items-center gap-3 group w-full sm:w-auto justify-center">
              Send Message <Send size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// --- BLOG PAGE ---
export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Farming', 'Health', 'Recipes', 'Tips'];
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const blogQuery = query(collection(db, 'blogPosts'));
        const snapshot = await getDocs(blogQuery);
        setPosts(snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as BlogPost)));
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return posts;
    return posts.filter(post => post.category === activeCategory);
  }, [activeCategory, posts]);

  const featuredPost = activeCategory === 'All' ? posts[0] : filteredPosts[0];
  const gridPosts = activeCategory === 'All' ? posts.slice(1) : filteredPosts.slice(1);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Blog Hero */}
      <div className="bg-[#f0fdf4] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-green-200/40 to-yellow-100/40 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full mb-6 shadow-sm border border-green-100">
            <span className="w-2 h-2 bg-leaf-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-leaf-800 tracking-widest uppercase">FreshLeaf Journal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">Stories from <br/> the Farm</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover healthy recipes, sustainable farming stories, and tips to keep your produce fresh longer.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 pb-24 relative z-20 -mt-12">
        
        {/* Category Filters */}
        <div className="flex justify-center mb-16">
          <div className="bg-white p-2 rounded-full shadow-xl border border-gray-100 inline-flex gap-1 overflow-x-auto max-w-full scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-leaf-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center text-sm text-gray-400 mb-12">Loading articles...</div>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center text-sm text-gray-400 mb-12">No articles available right now.</div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <div className="group cursor-pointer mb-20 animate-in fade-in duration-700">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[500px] md:h-[600px]">
               <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
               <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 inline-block">{featuredPost.category}</span>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight group-hover:underline decoration-leaf-400 underline-offset-8 transition-all">{featuredPost.title}</h2>
                  <p className="text-gray-200 text-lg md:text-xl line-clamp-2 max-w-3xl mb-8">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center gap-4">
                     <img src={featuredPost.authorAvatar} className="w-12 h-12 rounded-full border-2 border-white" alt={featuredPost.author} />
                     <div>
                        <p className="font-bold text-sm">{featuredPost.author}</p>
                        <p className="text-xs opacity-70">{featuredPost.date} • {featuredPost.readTime}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {gridPosts.map((post, idx) => (
            <article key={post.id} className="group flex flex-col h-full animate-in slide-in-from-bottom-8 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="rounded-[2rem] overflow-hidden mb-6 relative h-64 shadow-md group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide text-gray-900">
                  {post.category}
                </div>
              </div>
              
              <div className="flex-grow flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-leaf-600 transition-colors leading-tight">
                  <Link to="/blog">{post.title}</Link>
                </h3>
                
                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-3">
                   <img src={post.authorAvatar} className="w-10 h-10 rounded-full bg-gray-100 object-cover" alt="" />
                   <div>
                      <p className="text-sm font-bold text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">Author</p>
                   </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

// Legal Pages Wrapper
const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-20 bg-gray-50 min-h-screen font-sans">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white rounded-[2rem] shadow-xl p-10 md:p-16 border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 pb-6 border-b border-gray-100">{title}</h1>
        <div className="prose prose-leaf prose-lg max-w-none text-gray-600">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy">
    <p><strong>Effective Date:</strong> October 24, 2023</p>
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h3>
    <p>Welcome to <strong>FreshLeaf</strong>. We respect your privacy and are committed to protecting your personal data.</p>
    {/* ... content simplified for brevity ... */}
  </LegalLayout>
);

export const TermsConditions: React.FC = () => (
  <LegalLayout title="Terms & Conditions">
    <p><strong>Last Updated:</strong> October 24, 2023</p>
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance</h3>
    <p>By using our services, you agree to these terms.</p>
  </LegalLayout>
);

export const ShippingPolicy: React.FC = () => (
  <LegalLayout title="Shipping Policy">
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Delivery Areas</h3>
    <p>We currently ship to major metro cities in India.</p>
  </LegalLayout>
);

export const RefundPolicy: React.FC = () => (
  <LegalLayout title="Refund Policy">
    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">No Questions Asked</h3>
    <p>Return any item at the time of delivery if you are unsatisfied.</p>
  </LegalLayout>
);

export const CancellationPolicy: React.FC = () => (
  <LegalLayout title="Cancellation Policy">
    <p>Cancel anytime before packing starts.</p>
  </LegalLayout>
);

export const Disclaimer: React.FC = () => (
  <LegalLayout title="Disclaimer">
    <p>Images are for illustrative purposes only.</p>
  </LegalLayout>
);
