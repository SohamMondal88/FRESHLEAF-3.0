
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, ArrowRight, Leaf, Sun, Droplets, MapPin, 
  Info, Star, ShoppingCart, ChevronDown, BookOpen 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProduct } from '../services/ProductContext';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';

export const Catalogue: React.FC = () => {
  const { products } = useProduct();
  const { addToCart } = useCart();
  const { getProductImage } = useImage();
  const [activeSection, setActiveSection] = useState('Fruits');

  // --- DATA ORGANIZATION ---
  const sections = useMemo(() => [
    {
      id: 'Fruits',
      title: 'Orchard Fresh Fruits',
      subtitle: 'Sun-ripened sweetness from Himachal to Ratnagiri',
      description: 'Our fruits are allowed to ripen on the tree for maximum flavor and nutrition. We source directly from orchards that practice sustainable farming.',
      bgImage: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      products: products.filter(p => p.category === 'Fruit' || p.category === 'Mango' || p.category === 'Banana' || p.category === 'Apple' || p.category === 'Citrus' || p.category === 'Melon' || p.category === 'Grapes' || p.category === 'Stone Fruit' || p.category === 'Berry')
    },
    {
      id: 'Vegetables',
      title: 'Daily Farm Veggies',
      subtitle: 'Rooted in health, harvested with care',
      description: 'From crunchy carrots to tender okra, our daily vegetables are harvested at dawn and delivered to our distribution centers by noon.',
      bgImage: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=1200&q=80',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      products: products.filter(p => p.category === 'Fruit Veg' || p.category === 'Root Veg' || p.category === 'Bulb' || p.category === 'Other Veg' || p.category === 'Beans/Legumes' || p.category === 'Flower Veg')
    },
    {
      id: 'Leafy',
      title: 'Greens & Herbs',
      subtitle: 'Nutrient-packed foliage for vitality',
      description: 'Our leafy greens are grown using hydroponic and organic soil methods to ensure they are 100% pesticide-free and residue-free.',
      bgImage: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80',
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      products: products.filter(p => p.category === 'Leafy')
    },
    {
      id: 'Exotic',
      title: 'Global & Exotic',
      subtitle: 'Rare finds for the gourmet chef',
      description: 'Experience the world on your plate. From Mexican Avocados to Thai Dragonfruit, we bring the best of the world to your doorstep.',
      bgImage: 'https://images.unsplash.com/photo-1596363820465-672723a3cb86?auto=format&fit=crop&w=1200&q=80',
      color: 'text-purple-800',
      bgColor: 'bg-purple-50',
      products: products.filter(p => p.category === 'Exotic' || p.category === 'Imported Fruit')
    }
  ], [products]);

  // Scroll Spy for Navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mock Data Helper
  const getProductDetails = (product: any) => ({
    origin: product.isLocal ? 'Local Farms, West Bengal' : 'Sourced from Nashik/Himachal',
    harvestTime: 'Daily 6:00 AM',
    benefits: ['Rich in Fiber', 'Vitamin Boost', 'Antioxidant'].slice(0, 2),
    calories: Math.floor(Math.random() * 80 + 20)
  });

  return (
    <div className="bg-[#fdfbf7] min-h-screen font-sans text-gray-800">
      
      {/* 1. MAGAZINE COVER HERO */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
           <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover brightness-[0.6]" alt="Cover" />
        </div>
        <div className="relative z-10 text-center text-white px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <BookOpen size={14} /> Vol. 12 • October 2023
           </div>
           <h1 className="text-5xl md:text-8xl font-serif font-medium mb-6 leading-tight">
             The Harvest <br/> <span className="italic font-light">Edit</span>
           </h1>
           <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto font-light mb-10 leading-relaxed">
             A curated guide to the season's finest organic produce. Discover the stories, benefits, and flavors of our farm-fresh collection.
           </p>
           <button onClick={() => window.print()} className="bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition shadow-xl flex items-center gap-2 mx-auto group">
             <Download size={18} /> Download Catalogue PDF
           </button>
        </div>
      </div>

      {/* 2. STICKY SUB-NAV */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center min-w-max">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-4 ${
                  activeSection === section.id 
                    ? `border-leaf-600 text-leaf-800 bg-leaf-50/50` 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONTENT SECTIONS */}
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-24">
        {sections.map((section, idx) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            
            {/* Section Header */}
            <div className={`rounded-[3rem] overflow-hidden shadow-2xl mb-12 relative h-[400px] flex items-end group ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
               <img src={section.bgImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt={section.title} />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               
               <div className="relative z-10 p-10 md:p-16 text-white max-w-3xl">
                  <div className={`inline-block p-3 rounded-2xl mb-6 ${section.bgColor} backdrop-blur-md bg-opacity-20 border border-white/20`}>
                     <Leaf className="text-white" size={32} />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif mb-4">{section.title}</h2>
                  <p className="text-xl md:text-2xl font-light text-white/90 mb-4">{section.subtitle}</p>
                  <p className="text-white/80 leading-relaxed max-w-xl">{section.description}</p>
               </div>
            </div>

            {/* Product Listing (Magazine Style) */}
            <div className="grid grid-cols-1 gap-8">
               {section.products.map(product => {
                 const details = getProductDetails(product);
                 return (
                   <div key={product.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 items-center">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
                         <img src={getProductImage(product.id, product.image)} alt={product.name.en} className="w-full h-full object-cover mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-110" />
                         {product.isOrganic && (
                           <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Organic</div>
                         )}
                      </div>

                      {/* Content */}
                      <div className="flex-grow space-y-4 text-center md:text-left w-full">
                         <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                               <h3 className="text-2xl font-bold text-gray-900 font-serif">{product.name.en}</h3>
                               <div className="flex justify-center md:justify-start gap-2 text-xs text-gray-500">
                                  <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{product.name.hi}</span>
                                  <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{product.name.bn}</span>
                               </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                         </div>

                         {/* Details Grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                            <div className="text-center md:text-left">
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><MapPin size={10}/> Origin</p>
                               <p className="text-sm font-bold text-gray-700">{details.origin}</p>
                            </div>
                            <div className="text-center md:text-left">
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><Sun size={10}/> Harvest</p>
                               <p className="text-sm font-bold text-gray-700">{details.harvestTime}</p>
                            </div>
                            <div className="text-center md:text-left">
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><Droplets size={10}/> Nutrition</p>
                               <p className="text-sm font-bold text-gray-700">{details.benefits[0]}</p>
                            </div>
                            <div className="text-center md:text-left">
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><Star size={10}/> Rating</p>
                               <p className="text-sm font-bold text-gray-700 flex items-center justify-center md:justify-start gap-1">4.8 <span className="text-yellow-400">★</span></p>
                            </div>
                         </div>
                      </div>

                      {/* Action */}
                      <div className="flex flex-row md:flex-col items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                         <div className="text-left md:text-right">
                            <p className="text-xs text-gray-400 font-medium">Price per {product.baseUnit}</p>
                            <p className="text-3xl font-extrabold text-gray-900">₹{product.price}</p>
                         </div>
                         <button 
                           onClick={() => addToCart(product)}
                           className="bg-gray-900 text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-leaf-600 hover:scale-110 transition-all active:scale-95"
                           title="Add to Cart"
                         >
                            <ShoppingCart size={20} />
                         </button>
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="text-center mt-12">
               <Link to={`/shop?category=${section.id === 'Fruits' ? 'Fruit' : section.id === 'Vegetables' ? 'Veg' : section.id}`} className="inline-flex items-center gap-2 text-leaf-700 font-bold text-sm hover:underline uppercase tracking-widest">
                  View Full {section.title} Collection <ArrowRight size={16}/>
               </Link>
            </div>

          </section>
        ))}
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="bg-leaf-900 text-white py-16 text-center">
         <div className="container mx-auto px-4">
            <Leaf size={40} className="mx-auto mb-6 text-leaf-400 opacity-50" />
            <h2 className="text-3xl font-serif mb-4">FreshLeaf Catalogue</h2>
            <p className="text-leaf-200 max-w-xl mx-auto mb-8">
               Our catalogue is updated weekly based on seasonal availability and harvest cycles. Prices are subject to change based on market rates.
            </p>
            <p className="text-sm text-leaf-400">© 2023 FreshLeaf Organic Market. All Rights Reserved.</p>
         </div>
      </div>

    </div>
  );
};
