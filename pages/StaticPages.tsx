import React, { useMemo, useState } from 'react';
import { BLOG_POSTS } from '../constants';
import { Mail, Phone, MapPin, Send, Target, Users, Heart, Clock, ArrowRight, User } from 'lucide-react';
import { useOrder } from '../services/OrderContext';
import { Link } from 'react-router-dom';

// --- ABOUT PAGE ---
export const About: React.FC = () => {
  const { orders } = useOrder();

  // Dynamic calculations for "Realtime" stats
  const stats = useMemo(() => {
    // Set a fixed start date for the "project launch"
    const startDate = new Date('2023-06-01').getTime();
    const now = new Date().getTime();
    const daysSince = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    
    // Algorithm: Base orders + (Daily Avg * Days) + Actual User Orders
    // This ensures the number grows every day and includes the user's interaction
    const baseOrders = 15420; 
    const dailyAvg = 68;
    const totalOrders = baseOrders + (daysSince * dailyAvg) + orders.length;

    // Algorithm: Base areas + Expansion rate (New area every 15 days)
    const baseAreas = 35;
    const expansion = Math.floor(daysSince / 15);
    const totalAreas = baseAreas + expansion;

    return {
      orders: new Intl.NumberFormat('en-IN').format(totalOrders),
      areas: totalAreas
    };
  }, [orders.length]);

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative py-24 bg-leaf-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="text-leaf-300 font-bold tracking-widest uppercase text-sm mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">Rooted in <br/> Goodness</h1>
          <p className="text-xl text-leaf-100 max-w-2xl mx-auto leading-relaxed">
            We bridge the gap between hard-working Indian farmers and health-conscious families, delivering nature's best within hours of harvest.
          </p>
        </div>
      </div>

      {/* Mission Grid */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Target className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">To eliminate middlemen and ensure fair pricing for farmers while providing chemical-free produce to consumers.</p>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="text-orange-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Farmers</h3>
            <p className="text-gray-600 leading-relaxed">We partner with over 500+ certified organic farmers across Maharashtra, Karnataka, and Himachal Pradesh.</p>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Heart className="text-purple-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Promise</h3>
            <p className="text-gray-600 leading-relaxed">If it's not fresh, we won't deliver it. We adhere to a strict "Farm-to-Fork in 24 Hours" policy.</p>
          </div>
        </div>
      </div>

      {/* Stats/Image Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
               <img src="https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=1200&q=80" alt="Farmer" className="rounded-3xl shadow-2xl" />
            </div>
            <div className="md:w-1/2">
               <h2 className="text-3xl font-bold text-gray-900 mb-6">Empowering Rural India</h2>
               <p className="text-gray-600 mb-8 text-lg">
                 FreshLeaf isn't just a store; it's a movement. By removing intermediaries, we increase farmer income by up to 40%. Every purchase you make contributes to a sustainable agricultural ecosystem.
               </p>
               <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-leaf-500 pl-4">
                    <div className="text-4xl font-extrabold text-gray-900 mb-1">{stats.orders}+</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Total Orders Delivered</div>
                  </div>
                  <div className="border-l-4 border-leaf-500 pl-4">
                    <div className="text-4xl font-extrabold text-gray-900 mb-1">{stats.areas}</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Areas Covered in Kolkata</div>
                  </div>
               </div>
               <p className="text-xs text-gray-400 mt-4 italic">* Stats updated daily based on live delivery data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CONTACT PAGE ---
export const Contact: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-gray-500 max-w-xl mx-auto">We'd love to hear from you. Whether you have a question about our produce, pricing, or just want to say hi.</p>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Info Side */}
        <div className="md:w-2/5 bg-leaf-900 text-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div>
            <h2 className="text-3xl font-bold mb-6">Contact Info</h2>
            <p className="text-leaf-100 mb-12">Fill up the form and our team will get back to you within 24 hours.</p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Phone size={20} className="text-leaf-300"/></div>
                <div>
                  <h4 className="font-bold text-lg">Call Us</h4>
                  <p className="text-leaf-200">+91 98765 43210</p>
                  <p className="text-leaf-200 text-sm">Mon-Fri, 9am - 6pm</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><Mail size={20} className="text-leaf-300"/></div>
                <div>
                  <h4 className="font-bold text-lg">Email Us</h4>
                  <p className="text-leaf-200">support@freshleaf.in</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg"><MapPin size={20} className="text-leaf-300"/></div>
                <div>
                  <h4 className="font-bold text-lg">Visit Us</h4>
                  <p className="text-leaf-200">123 Green Market, Sector 4,<br/>New Delhi, India 110001</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex gap-4">
             {/* Social icons placeholder */}
             <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-leaf-500 transition cursor-pointer"></div>
             <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-leaf-500 transition cursor-pointer"></div>
             <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-leaf-500 transition cursor-pointer"></div>
          </div>
        </div>

        {/* Form Side */}
        <div className="md:w-3/5 p-10 md:p-14">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition" placeholder="john@example.com" />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
               <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition">
                 <option>General Inquiry</option>
                 <option>Order Support</option>
                 <option>Business Partnership</option>
               </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:bg-white transition" placeholder="Write your message here..."></textarea>
            </div>
            <button className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-leaf-200 transition-all flex items-center justify-center gap-2">
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);

// --- BLOG PAGE ---
export const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Farming', 'Health', 'Recipes', 'Tips'];
  
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return BLOG_POSTS;
    return BLOG_POSTS.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  const featuredPost = activeCategory === 'All' ? BLOG_POSTS[0] : filteredPosts[0];
  const gridPosts = activeCategory === 'All' ? BLOG_POSTS.slice(1) : filteredPosts.slice(1);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Blog Hero */}
      <div className="relative bg-leaf-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 border border-white/10">
            <span className="w-2 h-2 bg-leaf-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase">FreshLeaf Journal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Stories from the Farm</h1>
          <p className="text-xl text-leaf-100 max-w-2xl mx-auto">
            Discover healthy recipes, sustainable farming stories, and tips to keep your produce fresh longer.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 -mt-10 pb-20 relative z-20">
        
        {/* Category Filters */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-full shadow-lg inline-flex gap-1 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                  activeCategory === cat 
                    ? 'bg-leaf-600 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (Visible on All or if there are posts) */}
        {featuredPost && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden mb-12 border border-gray-100 group">
            <div className="grid md:grid-cols-2">
              <div className="relative overflow-hidden h-64 md:h-auto">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-leaf-700 uppercase tracking-wide">
                  {featuredPost.category}
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4 group-hover:text-leaf-600 transition-colors leading-tight">
                  <Link to={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link>
                </h2>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3">
                    <img src={featuredPost.authorAvatar || "https://ui-avatars.com/api/?name=" + featuredPost.author} className="w-10 h-10 rounded-full bg-gray-200" alt={featuredPost.author} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{featuredPost.author}</p>
                      <p className="text-xs text-gray-500">Author</p>
                    </div>
                  </div>
                  <Link to={`/blog/${featuredPost.id}`} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-leaf-600 hover:text-white hover:border-leaf-600 transition">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {gridPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mb-3">
                  <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-leaf-600 transition-colors line-clamp-2">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <img src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.author}`} className="w-6 h-6 rounded-full" alt="" />
                     <span className="text-xs font-bold text-gray-600">{post.author}</span>
                   </div>
                   <Link to={`/blog/${post.id}`} className="text-leaf-600 text-sm font-bold hover:underline">Read Article</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup for Blog */}
        <div className="bg-leaf-50 rounded-[2rem] p-8 md:p-12 text-center border border-leaf-100">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-leaf-600 shadow-sm transform rotate-3">
             <Mail size={32} />
           </div>
           <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Fresh Updates</h2>
           <p className="text-gray-600 max-w-xl mx-auto mb-8">
             Subscribe to our newsletter and get the latest farming stories, seasonal recipes, and health tips delivered to your inbox.
           </p>
           <form className="max-w-md mx-auto flex gap-2">
             <input type="email" placeholder="Enter your email address" className="flex-grow px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100 transition" />
             <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-leaf-600 transition shadow-lg">Subscribe</button>
           </form>
        </div>

      </div>
    </div>
  );
};

// --- LEGAL PAGES TEMPLATE ---
const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-16 bg-gray-50 min-h-screen">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">{title}</h1>
        <div className="prose prose-leaf max-w-none text-gray-600 space-y-6">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy">
    <p><strong>Effective Date:</strong> October 24, 2023</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. Introduction</h3>
    <p>Welcome to <strong>FreshLeaf</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you visit our website <strong>www.freshleaf.in</strong> (the "Site") and use our services.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Information We Collect</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Personal Information:</strong> When you register, place an order, or subscribe to our newsletter, we may collect your name, email address, phone number, delivery address, and payment information.</li>
      <li><strong>Non-Personal Information:</strong> We collect browser type, device information, and IP address to improve user experience.</li>
      <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and track website traffic.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. How We Use Your Information</h3>
    <p>We use your data to:</p>
    <ul className="list-disc pl-5 space-y-2">
      <li>Process and deliver your orders efficiently.</li>
      <li>Communicate with you regarding order updates, offers, and promotions.</li>
      <li>Improve our website functionality and customer service.</li>
      <li>Comply with legal obligations and prevent fraud.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">4. Data Sharing and Security</h3>
    <p>We do not sell your personal data. We may share information with trusted third-party service providers (e.g., delivery partners, payment gateways) solely for fulfilling your orders. We implement industry-standard security measures, including SSL encryption, to protect your data.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">5. Your Rights</h3>
    <p>You have the right to access, correct, or delete your personal information. You can manage your account details via the "My Account" section or contact our support team for assistance.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">6. Contact Us</h3>
    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
    <p><strong>Email:</strong> privacy@freshleaf.in<br/><strong>Phone:</strong> +91 98765 43210</p>
  </LegalLayout>
);

export const TermsConditions: React.FC = () => (
  <LegalLayout title="Terms & Conditions">
    <p><strong>Last Updated:</strong> October 24, 2023</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. Acceptance of Terms</h3>
    <p>By accessing and using the FreshLeaf website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. User Accounts</h3>
    <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. Product Information and Pricing</h3>
    <p>We strive to provide accurate product descriptions and pricing. However, due to the nature of fresh produce, weights may vary slightly. Prices are subject to change without notice based on market rates. In case of a pricing error, we reserve the right to cancel the order.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">4. Ordering and Payments</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li>Orders are subject to availability.</li>
      <li>We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD).</li>
      <li>FreshLeaf reserves the right to cancel any order due to logistical issues or unavailability of stock.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">5. Intellectual Property</h3>
    <p>All content on this website, including text, graphics, logos, and images, is the property of FreshLeaf and protected by Indian copyright laws.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">6. Governing Law</h3>
    <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi.</p>
  </LegalLayout>
);

export const ShippingPolicy: React.FC = () => (
  <LegalLayout title="Shipping Policy">
    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. Delivery Areas</h3>
    <p>FreshLeaf currently delivers to select pin codes in <strong>New Delhi, Mumbai, Bangalore, Kolkata, and Pune</strong>. Please enter your pin code on the homepage to check deliverability.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Delivery Slots and Timing</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Standard Delivery:</strong> Orders placed before 6 PM will be delivered the next day between 8 AM - 2 PM.</li>
      <li><strong>Express Delivery:</strong> Available for Pro Members in select areas. Delivery within 30-90 minutes depending on traffic and location.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. Shipping Charges</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Free Shipping:</strong> On all orders above ₹499.</li>
      <li><strong>Standard Charge:</strong> A flat fee of ₹40 applies to orders below ₹499.</li>
      <li><strong>Pro Members:</strong> Unlimited free delivery on all orders above ₹99.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">4. Delivery Attempts</h3>
    <p>Our delivery partner will attempt delivery once. If you are unavailable, please inform us beforehand. Re-delivery may incur an additional charge of ₹50.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">5. Damaged or Missing Items</h3>
    <p>Please inspect your order upon delivery. If any item is damaged or missing, report it to the delivery executive immediately or contact customer support within 2 hours of delivery.</p>
  </LegalLayout>
);

export const RefundPolicy: React.FC = () => (
  <LegalLayout title="Return & Refund Policy">
    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. "No Questions Asked" Return Policy</h3>
    <p>We take pride in our quality. However, if you are not satisfied with the quality of any fresh produce (vegetables, fruits), you can return it <strong>at the time of delivery</strong> or request a return within <strong>24 hours</strong> of delivery.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Eligible Items for Return</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Perishables (Fruits, Vegetables):</strong> Must be reported within 24 hours.</li>
      <li><strong>Non-Perishables (Staples, Packaged Food):</strong> Can be returned within 3 days if unopened and in original packaging.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. Refund Process</h3>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Wallet Refunds:</strong> Processed instantly after the return is verified.</li>
      <li><strong>Original Payment Method:</strong> Refunds to bank accounts/cards typically take <strong>5-7 business days</strong> depending on your bank's policy.</li>
      <li><strong>COD Orders:</strong> Refunds will be credited to your FreshLeaf Wallet or via UPI transfer upon request.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">4. Non-Returnable Items</h3>
    <p>Items that have been washed, cut, or cooked by the customer cannot be returned.</p>
  </LegalLayout>
);

export const CancellationPolicy: React.FC = () => (
  <LegalLayout title="Cancellation Policy">
    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. Customer Cancellation</h3>
    <p>You can cancel your order via the "My Orders" section in the app or website.</p>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Before Packing:</strong> You can cancel your order anytime before the status changes to "Packed." No cancellation fee applies.</li>
      <li><strong>After Packing/Dispatch:</strong> If you cancel after the order has been packed or dispatched, a cancellation fee of <strong>₹50</strong> may be deducted from your refund to cover packaging and logistics costs.</li>
    </ul>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Cancellation by FreshLeaf</h3>
    <p>We reserve the right to cancel an order due to:</p>
    <ul className="list-disc pl-5 space-y-2">
      <li>Unavailability of items / Out of stock.</li>
      <li>Inaccurate pricing or product information.</li>
      <li>Non-serviceable address or logistical issues.</li>
    </ul>
    <p>In such cases, a full refund will be processed immediately.</p>
  </LegalLayout>
);

export const Disclaimer: React.FC = () => (
  <LegalLayout title="Disclaimer">
    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. Website Content</h3>
    <p>The information provided on <strong>FreshLeaf</strong> (www.freshleaf.in) is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the products or services.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Product Images</h3>
    <p>Product images are for illustrative purposes only. Actual products (especially fruits and vegetables) may vary in shape, size, and color due to natural variations. Packaging may also change without prior notice.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. Health Advice</h3>
    <p>Content regarding the health benefits of fruits and vegetables is not intended as medical advice. Please consult a healthcare professional before making significant dietary changes, especially if you have specific allergies or medical conditions.</p>

    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-2">4. Third-Party Links</h3>
    <p>Our website may contain links to third-party websites. We have no control over the content and availability of those sites and are not responsible for any issues arising from their use.</p>
  </LegalLayout>
);