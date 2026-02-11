
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
const LegalLayout: React.FC<{ title: string; updatedOn: string; children: React.ReactNode }> = ({ title, updatedOn, children }) => (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-slate-100 py-12 font-sans sm:py-16">
    <div className="pointer-events-none absolute inset-0 opacity-50">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200 blur-3xl"></div>
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-teal-100 blur-3xl"></div>
    </div>
    <div className="container relative z-10 mx-auto max-w-5xl px-4">
      <div className="mb-6 rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-lg shadow-emerald-100/40 backdrop-blur sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Legal information</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: {updatedOn}</p>
      </div>
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-emerald-100/30 sm:p-10">
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy" updatedOn="February 2026">
    <p>
      FreshLeaf ("we", "our", "us") values your privacy. This policy explains what data we collect, why we collect it, and how we protect it
      when you use our website, mobile experiences, and support channels.
    </p>
    <h3>1. Information we collect</h3>
    <ul>
      <li><strong>Account data:</strong> name, phone number, email address, and saved addresses.</li>
      <li><strong>Order data:</strong> cart items, delivery slot, payment status, and order history.</li>
      <li><strong>Device and usage data:</strong> browser type, pages visited, session activity, and diagnostics for security.</li>
      <li><strong>Support data:</strong> chat/call/email records to resolve complaints and improve service quality.</li>
    </ul>
    <h3>2. How we use your data</h3>
    <ul>
      <li>To process orders, deliveries, refunds, and wallet transactions.</li>
      <li>To communicate order updates, service alerts, and support responses.</li>
      <li>To prevent fraud, enforce terms, and maintain account security.</li>
      <li>To improve our product catalog, delivery experience, and recommendations.</li>
    </ul>
    <h3>3. Payment and security</h3>
    <p>
      Online payments are processed via trusted payment partners (for example Razorpay). FreshLeaf does not store your full card details on our
      servers. We use secure authentication, controlled access, and monitoring to protect your information.
    </p>
    <h3>4. Data sharing</h3>
    <p>
      We share only the minimum required information with logistics partners, customer support tools, and payment providers to complete your
      requests. We do not sell personal data.
    </p>
    <h3>5. Your rights</h3>
    <ul>
      <li>Update your profile details and addresses from your account dashboard.</li>
      <li>Request correction or deletion of account data by contacting support.</li>
      <li>Opt out of promotional communication at any time.</li>
    </ul>
    <h3>6. Retention</h3>
    <p>
      We retain data for operational, legal, tax, and dispute-resolution purposes for as long as required. Backup copies may remain for a limited
      period before secure deletion.
    </p>
    <h3>7. Contact for privacy concerns</h3>
    <p>
      Email us at <strong>privacy@freshleaf.in</strong> or call customer support to submit privacy requests, report concerns, or seek clarification.
    </p>
  </LegalLayout>
);

export const TermsConditions: React.FC = () => (
  <LegalLayout title="Terms & Conditions" updatedOn="February 2026">
    <h3>1. Acceptance of terms</h3>
    <p>
      By creating an account, browsing products, or placing an order with FreshLeaf, you agree to these terms and all related policies.
    </p>
    <h3>2. Account responsibilities</h3>
    <ul>
      <li>Provide accurate contact and delivery details.</li>
      <li>Keep login and OTP access secure.</li>
      <li>You are responsible for activity from your account.</li>
    </ul>
    <h3>3. Pricing and availability</h3>
    <p>
      Product prices, stock status, and delivery slots may change based on demand, farm supply, and service area conditions. Final pricing is shown
      at checkout.
    </p>
    <h3>4. Orders and delivery</h3>
    <ul>
      <li>Orders are confirmed only after successful placement in the app.</li>
      <li>Delivery timelines are estimates and may be impacted by weather, traffic, or force majeure.</li>
      <li>Please ensure someone is available to receive perishables at delivery.</li>
    </ul>
    <h3>5. Payments</h3>
    <p>
      We support online payments and cash on delivery in eligible areas. Failed, pending, or disputed transactions may delay dispatch until
      resolution.
    </p>
    <h3>6. Wallet, rewards, and promos</h3>
    <p>
      Wallet credits, coupons, and referral rewards are promotional benefits and may have validity windows, usage limits, and anti-abuse checks.
    </p>
    <h3>7. Prohibited actions</h3>
    <ul>
      <li>Fraudulent transactions, abuse of offers, or misuse of support channels.</li>
      <li>Attempts to interfere with platform security or data integrity.</li>
    </ul>
    <h3>8. Limitation of liability</h3>
    <p>
      To the maximum extent permitted by law, FreshLeaf is not liable for indirect or consequential losses arising from service interruptions,
      third-party failures, or delayed deliveries.
    </p>
  </LegalLayout>
);

export const ShippingPolicy: React.FC = () => (
  <LegalLayout title="Shipping Policy" updatedOn="February 2026">
    <h3>1. Serviceable locations</h3>
    <p>FreshLeaf delivers to selected pin codes. Availability is shown at checkout based on your current delivery address and active service areas.</p>
    <h3>2. Delivery windows</h3>
    <ul>
      <li>Standard delivery slots are shown during checkout.</li>
      <li>Same-day delivery may be available in selected locations and time bands.</li>
      <li>Festive days, heavy rains, and high-order periods may affect timelines.</li>
    </ul>
    <h3>3. Shipping charges</h3>
    <p>
      Delivery charges, handling fee, and platform fee are displayed transparently in the bill summary before payment. Any applicable discount is
      also shown there.
    </p>
    <h3>4. Failed delivery attempts</h3>
    <p>
      If delivery cannot be completed due to incorrect address, unreachable phone number, or customer unavailability, we may reschedule once or
      cancel as per operational feasibility.
    </p>
    <h3>5. Packaging and freshness</h3>
    <p>
      Perishable items are packed for freshness and safe transport. Please inspect your order at delivery and report quality concerns immediately via
      Help Desk.
    </p>
  </LegalLayout>
);

export const RefundPolicy: React.FC = () => (
  <LegalLayout title="Refund & Return Policy" updatedOn="February 2026">
    <h3>1. Return at delivery</h3>
    <p>
      You may reject any item at delivery if it does not meet expectations. Rejected items are adjusted instantly in the payable amount (for COD) or
      refunded to original mode/wallet for prepaid orders.
    </p>
    <h3>2. Post-delivery complaints</h3>
    <p>
      For quality or missing item complaints, contact support within 24 hours of delivery with order details and photos where possible.
    </p>
    <h3>3. Refund timelines</h3>
    <ul>
      <li><strong>Wallet credit:</strong> usually instant to 24 hours after approval.</li>
      <li><strong>UPI/Card/Netbanking:</strong> typically 3–7 business days, depending on your bank/payment partner.</li>
    </ul>
    <h3>4. Non-returnable scenarios</h3>
    <ul>
      <li>Claims raised after the complaint window closes.</li>
      <li>Damage caused by improper storage after delivery.</li>
      <li>Promotional/freebie items where replacement is not feasible.</li>
    </ul>
    <h3>5. Partial refunds and adjustments</h3>
    <p>
      Refund amount is calculated based on item-level validation and may be issued as wallet credit, source reversal, or order adjustment depending
      on payment method and case type.
    </p>
  </LegalLayout>
);

export const CancellationPolicy: React.FC = () => (
  <LegalLayout title="Cancellation Policy" updatedOn="February 2026">
    <p>
      You can cancel orders before packing starts from your orders section. Once packed or out for delivery, cancellation may be restricted. For
      prepaid orders, eligible refunds follow the Refund & Return Policy timeline.
    </p>
  </LegalLayout>
);

export const Disclaimer: React.FC = () => (
  <LegalLayout title="Disclaimer" updatedOn="February 2026">
    <p>
      Product images and descriptions are illustrative and may vary slightly due to seasonality and source farm differences. Nutritional and health
      information is for general awareness only and not medical advice.
    </p>
  </LegalLayout>
);
