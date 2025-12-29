
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, X, Filter, ArrowUpDown, Star, Leaf, 
  MapPin, Zap, ChevronDown, RefreshCw, Grid, 
  BookOpen, ShoppingCart, Check, ChevronRight, ChevronLeft,
  Sun, Snowflake, Coffee, ShoppingBag, Flame, ArrowRight
} from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Product } from '../types';

// --- MOBILE 3D CAROUSEL COMPONENT ---
const Mobile3DCarousel: React.FC<{ 
  title: string; 
  subtitle?: string;
  products: Product[]; 
  onSeeAll: () => void;
  bgColor?: string;
}> = ({ title, subtitle, products, onSeeAll, bgColor = 'bg-white' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Logic to determine the centered card
  const handleScroll = () => {
    if (scrollRef.current) {
        const container = scrollRef.current;
        const center = container.scrollLeft + container.offsetWidth / 2;
        
        let closestIndex = 0;
        let minDiff = Infinity;

        Array.from(container.children).forEach((child, index) => {
            const childCenter = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
            const diff = Math.abs(center - childCenter);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });
        
        setActiveIndex(closestIndex);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollAmount = container.offsetWidth * 0.85; // Scroll approx one card width
        container.scrollBy({ 
            left: direction === 'left' ? -scrollAmount : scrollAmount, 
            behavior: 'smooth' 
        });
    }
  };

  if (products.length === 0) return null;

  // Limit items for performance in 3D view
  const displayProducts = products.slice(0, 10); 

  return (
    <div className={`py-10 border-b border-gray-50 last:border-0 ${bgColor} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      <div className="flex justify-between items-end px-6 mb-6">
        <div>
            <h3 className="text-2xl font-extrabold text-gray-900 leading-none tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-wide opacity-80">{subtitle}</p>}
        </div>
        <button onClick={onSeeAll} className="text-xs font-bold text-leaf-700 flex items-center gap-1 bg-leaf-50/80 px-3 py-1.5 rounded-full shadow-sm hover:bg-leaf-100 transition">
          View All <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
      
      <div className="relative group">
        {/* Navigation Buttons (Glassmorphism) */}
        <button 
            onClick={() => scroll('left')} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white flex items-center justify-center text-gray-900 transition-all duration-300 active:scale-90 hover:bg-white ${activeIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Previous"
        >
            <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <button 
            onClick={() => scroll('right')} 
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white flex items-center justify-center text-gray-900 transition-all duration-300 active:scale-90 hover:bg-white ${activeIndex === displayProducts.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Next"
        >
            <ChevronRight size={24} strokeWidth={2.5} />
        </button>

        {/* Scroll Container */}
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 px-[7.5vw] pb-10 pt-4 scrollbar-hide snap-x snap-mandatory items-center"
            style={{ scrollBehavior: 'smooth' }}
        >
            {displayProducts.map((product, idx) => {
                const isActive = idx === activeIndex;
                const dist = Math.abs(idx - activeIndex);
                
                // 3D Transform Logic
                let scale = 'scale-90';
                let opacity = 'opacity-50';
                let blur = 'blur-[1px]';
                let zIndex = 'z-0';
                let rotate = 'rotate-y-0';
                
                if (isActive) {
                    scale = 'scale-100';
                    opacity = 'opacity-100';
                    blur = 'blur-0';
                    zIndex = 'z-20';
                } else if (dist === 1) {
                    scale = 'scale-95';
                    opacity = 'opacity-80';
                    blur = 'blur-0';
                    zIndex = 'z-10';
                }

                return (
                    <div 
                        key={product.id} 
                        className={`min-w-[85vw] snap-center transform transition-all duration-500 ease-out origin-center ${scale} ${opacity} ${zIndex} ${blur}`}
                    >
                        {/* Card Wrapper */}
                        <div className={`h-full bg-white rounded-[2.5rem] shadow-premium border border-gray-100 overflow-hidden relative transition-all duration-500 ${isActive ? 'ring-4 ring-leaf-500/10 shadow-2xl' : 'shadow-sm'}`}>
                             <div className="p-2 h-full">
                                <ProductCard product={product} /> 
                             </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products } = useProduct();
  const { addToCart } = useCart();
  const { getProductImage } = useImage();
  
  // URL Params
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  // --- LOCAL STATE ---
  const maxProductPrice = useMemo(() => Math.max(...products.map(p => p.price), 1000), [products]);
  
  const [priceRange, setPriceRange] = useState<number>(1000); 
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortOption, setSortOption] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'journal'>('grid'); 
  const [filters, setFilters] = useState({
    organic: false,
    local: false,
    onSale: false,
    inStock: false,
    rating4Plus: false
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Device Check
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state with URL param changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setPriceRange(maxProductPrice);
  }, [maxProductPrice]);

  // --- MOCK DATA FOR JOURNAL VIEW ---
  const getProductDetails = (product: any) => ({
    origin: product.isLocal ? 'Local Farms, West Bengal' : 'Sourced from Nashik/Himachal',
    harvestTime: 'Daily 6:00 AM',
    benefits: ['Rich in Fiber', 'Vitamin Boost', 'Antioxidant'].slice(0, 2),
    calories: Math.floor(Math.random() * 80 + 20)
  });

  // --- DERIVED DATA ---
  const categories = useMemo(() => {
    const cats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return cats;
  }, [products]);

  // Default View Condition
  const isDefaultView = useMemo(() => {
    return selectedCategory === 'All' && 
           !query && 
           priceRange === maxProductPrice && 
           !Object.values(filters).some(Boolean);
  }, [selectedCategory, query, priceRange, filters, maxProductPrice]);

  // Filtered Products for Grid View
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (query) {
        const lowerQ = query.toLowerCase();
        const matchName = product.name.en.toLowerCase().includes(lowerQ) || 
                          product.name.hi.toLowerCase().includes(lowerQ) ||
                          product.name.bn.toLowerCase().includes(lowerQ);
        const matchCat = product.category.toLowerCase().includes(lowerQ);
        if (!matchName && !matchCat) return false;
      }

      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
         if (selectedCategory === 'Fruits' && !['Fruit', 'Mango', 'Banana', 'Apple', 'Citrus', 'Melon', 'Grapes', 'Berry', 'Stone Fruit', 'Imported Fruit', 'Exotic'].includes(product.category)) return false;
         if (selectedCategory === 'Vegetables' && !['Fruit Veg', 'Root Veg', 'Bulb', 'Other Veg', 'Beans/Legumes', 'Flower Veg'].includes(product.category)) return false;
         if (!['Fruits', 'Vegetables', 'All'].includes(selectedCategory) && product.category !== selectedCategory) return false;
      }

      if (product.price > priceRange) return false;
      if (filters.organic && !product.isOrganic) return false;
      if (filters.local && !product.isLocal) return false;
      if (filters.inStock && !product.inStock) return false;
      if (filters.onSale && !product.oldPrice) return false;
      if (filters.rating4Plus && product.rating < 4) return false;

      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.en.localeCompare(b.name.en);
        default: return 0;
      }
    });
  }, [products, query, selectedCategory, priceRange, filters, sortOption]);

  // --- CURATED COLLECTIONS (Daily Rotate) ---
  const curatedCollections = useMemo(() => {
    const today = new Date().getDate();
    const rotate = (arr: any[]) => {
        const rotation = today % (arr.length || 1);
        return [...arr.slice(rotation), ...arr.slice(0, rotation)];
    };

    const fruits = products.filter(p => ['Fruit', 'Mango', 'Banana', 'Apple', 'Citrus', 'Melon', 'Grapes', 'Berry', 'Stone Fruit', 'Imported Fruit', 'Exotic'].includes(p.category));
    const vegs = products.filter(p => ['Fruit Veg', 'Root Veg', 'Bulb', 'Other Veg', 'Beans/Legumes', 'Flower Veg'].includes(p.category));
    
    return {
      fruits: fruits,
      vegetables: vegs,
      leafy: products.filter(p => p.category === 'Leafy'),
      exotic: products.filter(p => p.category === 'Exotic' || p.category === 'Imported Fruit'),
      deals: products.filter(p => p.oldPrice && p.oldPrice > p.price).sort((a,b) => (b.oldPrice! - b.price) - (a.oldPrice! - a.price)),
      budget: rotate(products.filter(p => p.price < 60)).slice(0, 10), // Profitable low cost items
      breakfast: products.filter(p => ['Banana', 'Apple', 'Papaya', 'Avocado', 'Melon', 'Berry', 'Citrus'].some(k => p.category.includes(k) || p.name.en.includes(k))),
      summer: products.filter(p => ['Mango', 'Watermelon', 'Cucumber', 'Lemon', 'Mint', 'Lychee'].some(k => p.name.en.includes(k))),
      winter: products.filter(p => ['Carrot', 'Peas', 'Orange', 'Spinach', 'Mustard', 'Radish'].some(k => p.name.en.includes(k))),
      everyday: products.filter(p => ['Potato', 'Onion', 'Tomato', 'Chilli', 'Garlic', 'Ginger'].some(k => p.name.en.includes(k))),
    };
  }, [products]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 8; 
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, selectedCategory, priceRange, filters, sortOption, viewMode]);

  // --- HANDLERS ---
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
    setIsMobileFilterOpen(false);
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setPriceRange(maxProductPrice);
    setFilters({ organic: false, local: false, onSale: false, inStock: false, rating4Plus: false });
    setSelectedCategory('All');
    setSearchParams({});
    setSortOption('featured');
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeFilterCount = [
    selectedCategory !== 'All',
    priceRange < maxProductPrice,
    ...Object.values(filters)
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-gray-800">
      
      {/* 1. HERO SLIDER */}
      <div className="relative h-[280px] md:h-[400px] overflow-hidden flex items-center justify-center">
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=80" 
              alt="Hero" 
              className="w-full h-full object-cover brightness-[0.6]"
            />
         </div>
         <div className="relative z-10 text-center text-white px-4 animate-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
               <BookOpen size={14} /> The Market • Vol. 12
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium mb-3 leading-tight">
               Nature's <span className="italic font-light text-green-300">Inventory</span>
            </h1>
            <p className="text-sm md:text-lg text-white/90 max-w-lg mx-auto font-light leading-relaxed">
               Explore our curated selection of organic produce, harvested daily and delivered fresh to your doorstep.
            </p>
         </div>
      </div>

      {/* 2. STICKY CATEGORY NAV */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex justify-start md:justify-center min-w-max gap-8">
            {['All', 'Fruits', 'Vegetables', 'Leafy', 'Exotic'].map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
                  selectedCategory === cat 
                    ? 'border-leaf-600 text-leaf-800' 
                    : 'border-transparent text-gray-400 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="container mx-auto px-0 md:px-4 py-8">
        
        {/* MOBILE VIEW: CAROUSELS (Only if Default View) */}
        {!isDesktop && isDefaultView ? (
          <div className="space-y-2 pb-20">
             
             {/* Search Bar */}
             <div className="px-4 mb-6">
               <div className="relative">
                 <input 
                   type="text" 
                   value={query}
                   onChange={(e) => { setSearchParams({ ...Object.fromEntries(searchParams), q: e.target.value }); }}
                   placeholder="Search items..." 
                   className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-leaf-500 shadow-sm"
                 />
                 <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
               </div>
             </div>

             {/* 1. Fruits */}
             <Mobile3DCarousel 
                title="Orchard Fresh Fruits" 
                subtitle="Sweetness from the trees" 
                products={curatedCollections.fruits} 
                onSeeAll={() => handleCategoryChange('Fruits')} 
             />

             {/* 2. Vegetables */}
             <Mobile3DCarousel 
                title="Daily Farm Veggies" 
                subtitle="Harvested at dawn" 
                products={curatedCollections.vegetables} 
                onSeeAll={() => handleCategoryChange('Vegetables')} 
             />

             {/* 3. Leafy */}
             <Mobile3DCarousel 
                title="Leafy Greens" 
                subtitle="Iron-packed foliage" 
                products={curatedCollections.leafy} 
                onSeeAll={() => handleCategoryChange('Leafy')} 
                bgColor="bg-green-50/50"
             />

             {/* 4. Exotic */}
             <Mobile3DCarousel 
                title="Exotic & Imported" 
                subtitle="Rare finds globally" 
                products={curatedCollections.exotic} 
                onSeeAll={() => handleCategoryChange('Exotic')} 
             />

             {/* 5. Deals */}
             <Mobile3DCarousel 
                title="⚡ Deals of the Day" 
                subtitle="Limited time offers" 
                products={curatedCollections.deals} 
                onSeeAll={() => setFilters(f => ({...f, onSale: true}))} 
                bgColor="bg-orange-50/50"
             />

             {/* 6. Budget Picks */}
             <Mobile3DCarousel 
                title="🔥 Budget Picks" 
                subtitle="Profitable choices under ₹60" 
                products={curatedCollections.budget} 
                onSeeAll={() => setPriceRange(60)} 
             />

             {/* 7. Breakfast */}
             <Mobile3DCarousel 
                title="☕ Breakfast Club" 
                subtitle="Start your day right" 
                products={curatedCollections.breakfast} 
                onSeeAll={() => handleCategoryChange('Fruits')} 
             />

             {/* 8. Summer */}
             <Mobile3DCarousel 
                title="☀️ Summer Coolers" 
                subtitle="Hydrating seasonal picks" 
                products={curatedCollections.summer} 
                onSeeAll={() => handleCategoryChange('Fruits')} 
                bgColor="bg-yellow-50/50"
             />

             {/* 9. Winter */}
             <Mobile3DCarousel 
                title="❄️ Winter Warmers" 
                subtitle="Root veggies & greens" 
                products={curatedCollections.winter} 
                onSeeAll={() => handleCategoryChange('Vegetables')} 
                bgColor="bg-blue-50/50"
             />

             {/* 10. Everyday */}
             <Mobile3DCarousel 
                title="🏠 Everyday Essentials" 
                subtitle="Staples for every kitchen" 
                products={curatedCollections.everyday} 
                onSeeAll={() => handleCategoryChange('Vegetables')} 
             />

          </div>
        ) : (
          /* DESKTOP VIEW (OR FILTERED MOBILE): GRID LAYOUT */
          <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-4 px-4 md:px-0">
            
            {/* SIDEBAR FILTER (Hidden on Mobile) */}
            <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8 sticky top-32 h-fit">
              <div className="relative">
                 <Search className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                 <input 
                   type="text" 
                   value={query}
                   onChange={(e) => { setSearchParams({ ...Object.fromEntries(searchParams), q: e.target.value }); }}
                   placeholder="Search catalogue..." 
                   className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-500/10 transition shadow-sm"
                 />
              </div>

              {/* View Mode Toggle */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide">Display Mode</h3>
                 <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-leaf-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Grid size={16}/> Grid
                    </button>
                    <button 
                      onClick={() => setViewMode('journal')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'journal' ? 'bg-white shadow-sm text-leaf-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <BookOpen size={16}/> Journal
                    </button>
                 </div>
              </div>

              {/* Price Slider */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Price Range</h3>
                 <div className="px-2">
                   <input 
                    type="range" 
                    min="0" 
                    max={maxProductPrice} 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-leaf-600"
                   />
                   <div className="flex justify-between mt-4 text-sm font-medium text-gray-600">
                     <span>₹0</span>
                     <span className="text-leaf-700 bg-leaf-50 px-3 py-1 rounded-lg font-bold border border-leaf-100">₹{priceRange}</span>
                   </div>
                 </div>
              </div>

              {/* Checkbox Filters */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Refine By</h3>
                <div className="space-y-3">
                  {[
                    { key: 'organic', label: 'Organic Certified', icon: Leaf, color: 'text-green-500' },
                    { key: 'local', label: 'Locally Sourced', icon: MapPin, color: 'text-blue-500' },
                    { key: 'rating4Plus', label: '4★ & Above', icon: Star, color: 'text-yellow-500' },
                    { key: 'onSale', label: 'On Sale', icon: Zap, color: 'text-orange-500' },
                    { key: 'inStock', label: 'In Stock', icon: Check, color: 'text-gray-400' }
                  ].map(({ key, label, icon: Icon, color }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition -mx-2">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${filters[key as keyof typeof filters] ? 'bg-leaf-600 border-leaf-600' : 'border-gray-300 group-hover:border-leaf-400'}`}>
                        {filters[key as keyof typeof filters] && <Check size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={filters[key as keyof typeof filters]}
                        onChange={() => toggleFilter(key as keyof typeof filters)}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 flex items-center gap-2 font-medium">
                        <Icon size={14} className={color} fill={key === 'rating4Plus' ? 'currentColor' : 'none'} /> {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* MAIN GRID CONTENT */}
            <main className="flex-1">
               
               {/* Header Bar */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                     <span className="font-bold text-gray-900 text-lg">{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
                     <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{filteredProducts.length} items</span>
                  </div>

                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="lg:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm transition"
                     >
                        <Filter size={16} /> Filters
                     </button>

                     <div className="relative">
                        <button 
                          onClick={() => setIsSortOpen(!isSortOpen)}
                          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-leaf-500 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition min-w-[180px] justify-between"
                        >
                          <span className="flex items-center gap-2"><ArrowUpDown size={14} /> 
                            {sortOption === 'featured' ? 'Sort: Featured' : 
                             sortOption === 'price-low' ? 'Price: Low to High' : 
                             sortOption === 'price-high' ? 'Price: High to Low' : 
                             sortOption === 'rating' ? 'Highest Rated' : 'Name (A-Z)'}
                          </span>
                          <ChevronDown size={14} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isSortOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100">
                              {[
                                { label: 'Featured', value: 'featured' },
                                { label: 'Price: Low to High', value: 'price-low' },
                                { label: 'Price: High to Low', value: 'price-high' },
                                { label: 'Highest Rated', value: 'rating' },
                                { label: 'Name (A-Z)', value: 'name' }
                              ].map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={() => { setSortOption(opt.value); setIsSortOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition ${sortOption === opt.value ? 'text-leaf-600 bg-leaf-50' : 'text-gray-700'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                     </div>
                  </div>
               </div>

               {/* Active Filters */}
               {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 animate-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wide self-center">Active:</span>
                    
                    {selectedCategory !== 'All' && (
                      <button onClick={() => handleCategoryChange('All')} className="bg-white border border-leaf-200 text-leaf-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-leaf-50 transition shadow-sm">
                        {selectedCategory} <X size={12} />
                      </button>
                    )}
                    {priceRange < maxProductPrice && (
                      <button onClick={() => setPriceRange(maxProductPrice)} className="bg-white border border-leaf-200 text-leaf-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-leaf-50 transition shadow-sm">
                        Max: ₹{priceRange} <X size={12} />
                      </button>
                    )}
                    {Object.entries(filters).map(([key, isActive]) => isActive && (
                      <button key={key} onClick={() => toggleFilter(key as keyof typeof filters)} className="bg-white border border-leaf-200 text-leaf-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-leaf-50 transition shadow-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace('4 Plus', '+').trim()} <X size={12} />
                      </button>
                    ))}
                    
                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto hover:underline px-2">
                      Clear All
                    </button>
                  </div>
               )}

               {/* Products Grid or Journal */}
               {filteredProducts.length > 0 ? (
                 <>
                   {viewMode === 'grid' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {currentProducts.map(product => (
                          <ProductCard key={product.id} product={product} highlightTerm={query} />
                        ))}
                     </div>
                   ) : (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        {currentProducts.map(product => {
                          const details = getProductDetails(product);
                          return (
                            <div key={product.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 items-center">
                               {/* Image */}
                               <div className="w-full md:w-48 h-48 shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                                  <img src={getProductImage(product.id, product.image)} alt={product.name.en} className="w-full h-full object-cover mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-110" />
                                  {product.isOrganic && (
                                    <div className="absolute top-3 left-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Organic</div>
                                  )}
                               </div>

                               {/* Content */}
                               <div className="flex-grow space-y-4 text-center md:text-left w-full">
                                  <div>
                                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-bold text-gray-900 font-serif cursor-pointer hover:text-leaf-700 transition-colors" onClick={() => navigate(`/product/${product.id}`)}>{product.name.en}</h3>
                                        <div className="flex justify-center md:justify-start gap-2 text-xs text-gray-500">
                                           <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{product.name.hi}</span>
                                           <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{product.name.bn}</span>
                                        </div>
                                     </div>
                                     <p className="text-gray-600 leading-relaxed line-clamp-2">{product.description}</p>
                                  </div>

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                                     <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><MapPin size={10}/> Origin</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{details.origin}</p>
                                     </div>
                                     <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><Sun size={10}/> Harvest</p>
                                        <p className="text-sm font-bold text-gray-700">{details.harvestTime}</p>
                                     </div>
                                     <div className="text-center md:text-left hidden sm:block">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center md:justify-start gap-1"><Zap size={10}/> Nutrition</p>
                                        <p className="text-sm font-bold text-gray-700">{details.benefits[0]}</p>
                                     </div>
                                     <div className="text-center md:text-left hidden sm:block">
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
                   )}

                   {/* Pagination */}
                   {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-16 bg-white p-4 rounded-full shadow-sm border border-gray-100 w-fit mx-auto">
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="text-sm font-bold text-gray-600 px-2 disabled:opacity-50 hover:text-leaf-600">Prev</button>
                      <span className="text-sm font-bold text-leaf-600 px-2">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="text-sm font-bold text-gray-600 px-2 disabled:opacity-50 hover:text-leaf-600">Next</button>
                    </div>
                  )}
                 </>
               ) : (
                 <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm animate-in zoom-in-95 flex flex-col items-center">
                   <div className="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mb-6 relative">
                     <div className="absolute inset-0 bg-leaf-100 rounded-full animate-ping opacity-20"></div>
                     <Search size={48} className="text-leaf-300" />
                   </div>
                   <h3 className="text-2xl font-extrabold text-gray-900 mb-3">No harvests found</h3>
                   <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                     We couldn't find any items matching your current filters. Try adjusting the price range or clearing some filters to see more results.
                   </p>
                   <button 
                    onClick={clearFilters}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2"
                   >
                     <RefreshCw size={18} /> Clear Filters & Show All
                   </button>
                 </div>
               )}
            </main>
          </div>
        )}
      </div>

      {/* 5. MOBILE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Filter size={18}/> Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-red-500 shadow-sm"><X size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
               {/* Mobile Categories */}
               <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Categories</h4>
                  <div className="space-y-2">
                    <button onClick={() => handleCategoryChange('All')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${selectedCategory === 'All' ? 'bg-leaf-100 text-leaf-800' : 'bg-gray-50 text-gray-600'}`}>All Products</button>
                    {Object.entries(categories).map(([cat, count]) => (
                      <button key={cat} onClick={() => handleCategoryChange(cat)} className={`w-full flex justify-between px-3 py-2 rounded-lg text-sm font-medium ${selectedCategory === cat ? 'bg-leaf-100 text-leaf-800' : 'bg-gray-50 text-gray-600'}`}>
                        <span>{cat}</span> <span className="opacity-60">{count}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* Mobile Price */}
               <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Price Range</h4>
                  <input type="range" min="0" max={maxProductPrice} value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-leaf-600" />
                  <div className="flex justify-between mt-2 font-bold text-sm"><span>₹0</span><span>₹{priceRange}</span></div>
               </div>

               {/* Mobile Status */}
               <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Refine By</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'organic', label: 'Organic Certified', icon: Leaf },
                      { key: 'local', label: 'Locally Sourced', icon: MapPin },
                      { key: 'rating4Plus', label: '4★ & Above', icon: Star },
                      { key: 'onSale', label: 'On Sale', icon: Zap },
                      { key: 'inStock', label: 'In Stock Only', icon: Check }
                    ].map(({ key, label, icon: Icon }) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Icon size={14}/> {label}</span>
                        <input type="checkbox" className="w-5 h-5 accent-leaf-600 rounded" checked={filters[key as keyof typeof filters]} onChange={() => toggleFilter(key as keyof typeof filters)} />
                      </label>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={clearFilters} className="flex-1 py-3 text-gray-600 font-bold hover:text-red-500 transition">Reset</button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="flex-[2] bg-leaf-600 text-white py-3 rounded-xl font-bold shadow-lg">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
