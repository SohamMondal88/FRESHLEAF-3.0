import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Search, X, Filter, SlidersHorizontal, 
  ArrowUpDown, Star, Leaf, Check, MapPin, Zap, ChevronDown, RefreshCw
} from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { ProductCard } from '../components/ui/ProductCard';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products } = useProduct();
  
  // URL Params
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  // --- LOCAL STATE ---
  // Determine max price dynamically from products
  const maxProductPrice = useMemo(() => Math.max(...products.map(p => p.price), 1000), [products]);
  
  const [priceRange, setPriceRange] = useState<number>(1000); 
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortOption, setSortOption] = useState('featured');
  const [filters, setFilters] = useState({
    organic: false,
    local: false,
    onSale: false,
    inStock: false
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Sync state with URL param changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Sync initial price range
  useEffect(() => {
    setPriceRange(maxProductPrice);
  }, [maxProductPrice]);

  // --- DERIVED DATA ---
  const categories = useMemo(() => {
    const cats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return cats;
  }, [products]);

  // --- FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query
      if (query) {
        const lowerQ = query.toLowerCase();
        const matchName = product.name.en.toLowerCase().includes(lowerQ) || 
                          product.name.hi.toLowerCase().includes(lowerQ) ||
                          product.name.bn.toLowerCase().includes(lowerQ);
        const matchCat = product.category.toLowerCase().includes(lowerQ);
        if (!matchName && !matchCat) return false;
      }

      // 2. Category
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;

      // 3. Price
      if (product.price > priceRange) return false;

      // 4. Flags
      if (filters.organic && !product.isOrganic) return false;
      if (filters.local && !product.isLocal) return false;
      if (filters.inStock && !product.inStock) return false;
      if (filters.onSale && !product.oldPrice) return false;

      return true;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.name.en.localeCompare(b.name.en);
        default: return 0; // Featured (original order or logic)
      }
    });
  }, [products, query, selectedCategory, priceRange, filters, sortOption]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, selectedCategory, priceRange, filters, sortOption]);

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
    setFilters({ organic: false, local: false, onSale: false, inStock: false });
    setSelectedCategory('All');
    setSearchParams({});
    setSortOption('featured');
  };

  const activeFilterCount = [
    selectedCategory !== 'All',
    priceRange < maxProductPrice,
    ...Object.values(filters)
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* 1. COMPACT HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-[64px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span onClick={() => { clearFilters(); navigate('/shop'); }} className="cursor-pointer hover:text-leaf-600">Shop</span>
              <ChevronRight size={14} />
              <span className="font-bold text-gray-900">{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{filteredProducts.length}</span>
            </div>

            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm transition"
              >
                <Filter size={16} /> Filters {activeFilterCount > 0 && <span className="bg-leaf-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{activeFilterCount}</span>}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-leaf-500 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition min-w-[160px] justify-between"
                >
                  <span className="flex items-center gap-2"><ArrowUpDown size={14} /> 
                    {sortOption === 'featured' ? 'Featured' : 
                     sortOption === 'price-low' ? 'Price: Low to High' : 
                     sortOption === 'price-high' ? 'Price: High to Low' : 
                     sortOption === 'rating' ? 'Highest Rated' : 'Name'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
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

          {/* Active Filters Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 items-center animate-in slide-in-from-top-2">
              <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wide">Active Filters:</span>
              
              {selectedCategory !== 'All' && (
                <button onClick={() => handleCategoryChange('All')} className="bg-leaf-50 border border-leaf-100 text-leaf-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-leaf-100 transition">
                  {selectedCategory} <X size={12} />
                </button>
              )}
              {priceRange < maxProductPrice && (
                <button onClick={() => setPriceRange(maxProductPrice)} className="bg-leaf-50 border border-leaf-100 text-leaf-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-leaf-100 transition">
                  Max: ₹{priceRange} <X size={12} />
                </button>
              )}
              {Object.entries(filters).map(([key, isActive]) => isActive && (
                <button key={key} onClick={() => toggleFilter(key as keyof typeof filters)} className="bg-leaf-50 border border-leaf-100 text-leaf-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-leaf-100 transition capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} <X size={12} />
                </button>
              ))}
              
              <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto hover:underline">
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 2. SIDEBAR FILTER (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8 h-fit sticky top-[160px]">
            
            {/* Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Categories
              </h3>
              <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                <button
                   onClick={() => handleCategoryChange('All')}
                   className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${selectedCategory === 'All' ? 'bg-leaf-50 text-leaf-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>All Products</span>
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">{products.length}</span>
                </button>
                {Object.entries(categories).map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${selectedCategory === cat ? 'bg-leaf-50 text-leaf-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <span>{cat}</span>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
               <div className="px-2">
                 <input 
                  type="range" 
                  min="0" 
                  max={maxProductPrice} 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-leaf-600"
                 />
                 <div className="flex justify-between mt-3 text-sm font-bold text-gray-700">
                   <span>₹0</span>
                   <span className="text-leaf-600 bg-leaf-50 px-2 py-1 rounded">₹{priceRange}</span>
                 </div>
               </div>
            </div>

            {/* Checkbox Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Product Status</h3>
              <div className="space-y-3">
                {[
                  { key: 'organic', label: 'Organic Only', icon: Leaf, color: 'text-green-500' },
                  { key: 'local', label: 'Local Farm', icon: MapPin, color: 'text-blue-500' },
                  { key: 'onSale', label: 'On Sale', icon: Zap, color: 'text-yellow-500' },
                  { key: 'inStock', label: 'In Stock Only', icon: Check, color: 'text-gray-900' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${filters[key as keyof typeof filters] ? 'bg-leaf-600 border-leaf-600' : 'border-gray-300 group-hover:border-leaf-400'}`}>
                      {filters[key as keyof typeof filters] && <Check size={12} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={filters[key as keyof typeof filters]}
                      onChange={() => toggleFilter(key as keyof typeof filters)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                      <Icon size={14} className={color} /> {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Banner Ad */}
            <div className="bg-gradient-to-br from-leaf-800 to-leaf-600 rounded-2xl p-6 text-white text-center relative overflow-hidden group">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <div className="relative z-10">
                 <h4 className="text-2xl font-extrabold mb-2">Join Pro</h4>
                 <p className="text-leaf-100 text-sm mb-4">Get free delivery on every order!</p>
                 <button onClick={() => navigate('/subscription')} className="bg-white text-leaf-700 px-6 py-2 rounded-full font-bold text-sm hover:bg-leaf-50 transition shadow-lg">Upgrade Now</button>
               </div>
            </div>

          </aside>

          {/* 3. PRODUCT GRID */}
          <main className="flex-1">
             {filteredProducts.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {currentProducts.map(product => (
                      <ProductCard key={product.id} product={product} highlightTerm={query} />
                    ))}
                 </div>

                 {/* Pagination */}
                 {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-leaf-50 hover:text-leaf-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <span className="text-sm font-bold text-gray-500">Page {currentPage} of {totalPages}</span>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-leaf-50 hover:text-leaf-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
               </>
             ) : (
               <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm animate-in zoom-in-95">
                 <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                 <p className="text-gray-500 mb-8 max-w-md mx-auto">
                   We couldn't find any items matching your current filters. Try adjusting the price range or clearing some filters.
                 </p>
                 <button 
                  onClick={clearFilters}
                  className="bg-leaf-600 hover:bg-leaf-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-leaf-200 flex items-center gap-2 mx-auto"
                 >
                   <RefreshCw size={18} /> Clear All Filters
                 </button>
               </div>
             )}
          </main>
        </div>
      </div>

      {/* 4. MOBILE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
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
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Status</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'organic', label: 'Organic' },
                      { key: 'local', label: 'Local Farm' },
                      { key: 'onSale', label: 'On Sale' },
                      { key: 'inStock', label: 'In Stock' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-bold text-gray-700">{label}</span>
                        <input type="checkbox" className="w-5 h-5 accent-leaf-600 rounded" checked={filters[key as keyof typeof filters]} onChange={() => toggleFilter(key as keyof typeof filters)} />
                      </label>
                    ))}
                  </div>
               </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button onClick={clearFilters} className="flex-1 py-3 text-gray-600 font-bold hover:text-red-500">Reset</button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="flex-[2] bg-leaf-600 text-white py-3 rounded-xl font-bold shadow-lg">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
