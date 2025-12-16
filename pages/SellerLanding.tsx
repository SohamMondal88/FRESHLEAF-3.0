import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, Truck, Wallet, CheckCircle, ArrowRight, 
  Sprout, MapPin, Star
} from 'lucide-react';

export const SellerLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. HERO SECTION */}
      <div className="relative bg-leaf-900 text-white overflow-hidden pb-20 pt-32 lg:pt-40">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80" 
                alt="Farm Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-leaf-900/90 via-leaf-800/80 to-leaf-900"></div>
        </div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-yellow-300">
              <Sprout size={16} /> #1 Platform for Indian Farmers
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Transform Your Harvest <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-300">Into Wealth</span>
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Connect directly with millions of households. Zero middlemen, transparent AI-driven pricing, and guaranteed payments within 24 hours of delivery.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                to="/seller/auth?mode=signup" 
                className="bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-900/50 flex items-center justify-center gap-2 group hover:-translate-y-1"
              >
                Start Selling Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link 
                to="/seller/auth?mode=login" 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                Seller Login
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-12 flex flex-wrap justify-center gap-8 text-gray-300 font-medium text-sm">
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Verified Buyers</div>
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> FSSAI Compliant</div>
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-400"/> Instant Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      <div className="container mx-auto px-4 relative z-20 -mt-16">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
              { label: "Active Farmers", value: "15,000+", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Monthly Volume", value: "250 Tons", icon: Truck, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Cities Covered", value: "12 Metro", icon: MapPin, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Farmer Earnings", value: "₹50Cr+", icon: Wallet, color: "text-green-600", bg: "bg-green-50" },
           ].map((stat, i) => (
               <div key={i} className="text-center group">
                   <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={32} />
                   </div>
                   <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                   <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
               </div>
           ))}
        </div>
      </div>

      {/* 3. WHY CHOOSE US (Bento Grid Style) */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-sm font-bold text-leaf-600 uppercase tracking-widest mb-3">Why FreshLeaf?</h2>
                <h3 className="text-4xl font-extrabold text-gray-900">Empowering Farmers with Technology</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Card 1 */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                        <TrendingUp size={32} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Fair Market Pricing</h4>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Our AI analyzes real-time demand to suggest the best price for your produce. No more underselling to local mandis.
                    </p>
                </div>

                {/* Card 2 (Featured) */}
                <div className="bg-leaf-800 p-8 rounded-[2.5rem] shadow-xl text-white transform md:-translate-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-green-300 mb-8 group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Wallet size={32} />
                    </div>
                    <h4 className="text-2xl font-bold mb-4">0% Commission</h4>
                    <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                        Keep 100% of your earnings for the first 3 months. After that, a minimal platform fee applies only on successful sales.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-green-300 bg-white/10 px-4 py-2 rounded-lg">
                        <CheckCircle size={16} /> Guaranteed Payment
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform">
                        <Truck size={32} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">We Handle Logistics</h4>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Just pack your harvest. Our logistics partner Bombax picks it up directly from your farm gate. No transportation headaches.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 bg-white overflow-hidden">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full blur-3xl opacity-50 transform scale-90"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80" 
                        alt="Farmer App" 
                        className="relative z-10 rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition duration-500"
                    />
                    {/* Floating Card */}
                    <div className="absolute -bottom-10 -left-6 md:-left-10 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-xs animate-float border border-gray-100">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="text-green-600" size={20}/></div>
                            <div className="font-bold text-gray-900">Payment Received</div>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">₹24,500</div>
                        <div className="text-xs text-gray-500 mt-1">Credited to Bank Account ending 8821</div>
                    </div>
                </div>
                
                <div className="md:w-1/2">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12 leading-tight">Start earning in <br/>4 simple steps</h2>
                    <div className="space-y-10">
                        {[
                            { title: "Register Your Farm", desc: "Sign up with basic details and upload KYC documents.", icon: "1" },
                            { title: "List Your Produce", desc: "Add details of your harvest, quantity, and expected date.", icon: "2" },
                            { title: "Quality Check & Pickup", desc: "Our team visits for QC and picks up the produce.", icon: "3" },
                            { title: "Receive Payment", desc: "Get paid directly to your bank account within 24 hours.", icon: "4" }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-6 group">
                                <div className="flex-shrink-0 w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 group-hover:bg-leaf-600 group-hover:text-white transition-all border border-gray-200 group-hover:border-leaf-600 shadow-sm">
                                    {step.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-leaf-700 transition-colors">{step.title}</h4>
                                    <p className="text-gray-500 leading-relaxed text-lg">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* 5. SUCCESS STORY */}
      <section className="py-24 bg-leaf-50 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-leaf-100 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                <div className="md:w-1/3">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-yellow-400 rounded-full transform translate-x-3 translate-y-3"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=400&q=80" 
                            alt="Happy Farmer" 
                            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                        />
                    </div>
                </div>
                <div className="md:w-2/3">
                    <div className="flex justify-center md:justify-start gap-1 mb-6">
                        {[1,2,3,4,5].map(i => <Star key={i} className="text-yellow-400 fill-current" size={24} />)}
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed mb-8">
                        "Since joining FreshLeaf, my wastage has gone down to almost zero. I get better rates than the mandi, and the payment is always on time. It's a blessing for small farmers like me."
                    </blockquote>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">Rajesh Kumar</h4>
                        <p className="text-leaf-600 font-medium text-lg">Organic Farmer, Pune (Member since 2021)</p>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* 6. FINAL CTA */}
      <div className="bg-leaf-900 py-24 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
         <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to grow your business?</h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join India's fastest growing farm-to-table network today. Registration is free.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                    to="/seller/auth?mode=signup" 
                    className="inline-flex items-center justify-center gap-3 bg-yellow-400 text-leaf-950 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-yellow-300 transition-all shadow-xl hover:scale-105"
                >
                    Create Seller Account <ArrowRight size={24} />
                </Link>
            </div>
            <p className="mt-8 text-sm text-gray-400">Join 15,000+ farmers • No credit card required</p>
         </div>
      </div>
    </div>
  );
};
