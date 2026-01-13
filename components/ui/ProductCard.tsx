
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, Zap as BuyIcon, Sprout, ChevronDown, Plus, Minus } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../services/CartContext';
import { useImage } from '../../services/ImageContext';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../services/ToastContext';
import { QuickViewModal } from './QuickViewModal';

interface Props {
  product: Product;
  highlightTerm?: string;
  onWishlistClick?: (product: Product) => void;
}

const getUnitOptions = (baseUnit: string) => {
  if (baseUnit === 'kg') {
    return [
      { label: '250g', multiplier: 0.25 },
      { label: '500g', multiplier: 0.5 },
      { label: '1kg', multiplier: 1 },
      { label: '2kg', multiplier: 2 },
    ];
  } else if (baseUnit === 'pc' || baseUnit === 'bunch') {
    return [
      { label: `1 ${baseUnit}`, multiplier: 1 },
      { label: `2 ${baseUnit}s`, multiplier: 2 },
      { label: `4 ${baseUnit}s`, multiplier: 4 },
      { label: `6 ${baseUnit}s`, multiplier: 6 },
    ];
  }
  return [{ label: `1 ${baseUnit}`, multiplier: 1 }];
};

export const ProductCard: React.FC<Props> = ({ product, highlightTerm, onWishlistClick }) => {
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const { getProductImage } = useImage();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [showQuickView, setShowQuickView] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const unitOptions = getUnitOptions(product.baseUnit);
  // Default to 1kg (index 2) for mass, else 0
  const defaultUnitIndex = product.baseUnit === 'kg' ? 2 : 0;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(defaultUnitIndex);

  const currentMultiplier = unitOptions[selectedUnitIdx].multiplier;
  const unitLabel = unitOptions[selectedUnitIdx].label;
  const displayPrice = Math.ceil(product.price * currentMultiplier);
  const oldDisplayPrice = product.oldPrice ? Math.ceil(product.oldPrice * currentMultiplier) : null;

  const displayImage = getProductImage(product.id, product.image);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUnitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!user) {
        addToast("Please login to add items to cart", "info");
        navigate('/login');
        return;
    }

    addToCart({ ...product, image: displayImage }, quantity, unitLabel, displayPrice);
    setQuantity(1); // Reset quantity after adding
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
        addToast("Please login to buy items", "info");
        navigate('/login');
        return;
    }

    addToCart({ ...product, image: displayImage }, quantity, unitLabel, displayPrice);
    navigate('/checkout');
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (onWishlistClick) {
        onWishlistClick(product);
    } else {
        isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
    }
  };

  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-300 text-gray-900 rounded-sm px-0.5">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const incrementQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrementQty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <>
      <div className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-leaf-200 transition-all duration-300 flex flex-col h-full overflow-visible z-0 hover:z-10">
        {/* 1. Image Area (Top) */}
        <div className="relative aspect-[4/3] bg-gray-50 rounded-t-3xl overflow-hidden">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img 
              src={displayImage} 
              alt={product.name.en} 
              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" 
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isOrganic && (
              <span className="bg-white/90 backdrop-blur-sm text-leaf-700 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-leaf-100 flex items-center gap-1">
                <Sprout size={10} className="fill-current"/> Organic
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-red-100">
                {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={toggleWishlist} 
            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-300 z-20 ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 scale-110' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:scale-110'}`}
          >
            <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>

          {/* Quick View Button (Desktop Hover) */}
          <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-6`}>
             <button 
               onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
               className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg hover:bg-leaf-50 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
             >
               <Eye size={14}/> Quick View
             </button>
          </div>
        </div>
        
        {/* 2. Content Area (Middle) */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="mb-2">
            <div className="flex justify-between items-start mb-1">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
               <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                 <Star size={10} fill="currentColor"/> {product.rating.toFixed(1)}
               </div>
            </div>
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-leaf-600 transition-colors line-clamp-1">
                {renderHighlightedText(product.name.en, highlightTerm)}
              </h3>
              <p className="text-xs text-gray-500 font-hindi truncate">{product.name.hi} / {product.name.bn}</p>
            </Link>
          </div>

          {/* Unit Selector & Price Row */}
          <div className="mt-auto mb-4 flex items-end justify-between gap-2">
             <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                    <span className="font-extrabold text-lg text-gray-900">₹{displayPrice}</span>
                    {oldDisplayPrice && <span className="text-xs text-gray-400 line-through">₹{oldDisplayPrice}</span>}
                </div>
                
                {/* Custom Unit Dropdown */}
                <div className="relative mt-1" ref={dropdownRef}>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsUnitOpen(!isUnitOpen); }}
                        className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
                    >
                        {unitLabel} <ChevronDown size={12} className={`transition-transform ${isUnitOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    
                    {isUnitOpen && (
                        <div className="absolute top-full left-0 mt-1 w-24 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-200">
                            {unitOptions.map((opt, idx) => (
                                <button
                                    key={opt.label}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedUnitIdx(idx);
                                        setIsUnitOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-gray-50 transition-colors ${selectedUnitIdx === idx ? 'text-leaf-600 bg-leaf-50' : 'text-gray-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
             </div>

             {/* Quantity Controls */}
             <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-9 shadow-sm">
                <button 
                    onClick={decrementQty} 
                    className={`w-8 h-full flex items-center justify-center rounded-l-lg transition-colors ${quantity === 1 ? 'text-gray-300 cursor-default' : 'text-gray-600 hover:bg-gray-100 hover:text-red-500'}`}
                >
                    <Minus size={14}/>
                </button>
                <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button 
                    onClick={incrementQty} 
                    className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-leaf-600 rounded-r-lg transition-colors"
                >
                    <Plus size={14}/>
                </button>
             </div>
          </div>

          {/* 3. Action Area (Bottom) - Split Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={handleAddToCart}
              className="col-span-1 bg-leaf-50 hover:bg-leaf-100 text-leaf-700 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-leaf-200"
              title={`Add ${quantity} to Cart`}
            >
              <ShoppingCart size={18} />
            </button>
            
            <button 
              onClick={handleBuyNow}
              className="col-span-3 bg-gray-900 hover:bg-leaf-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <BuyIcon size={14} fill="currentColor" /> Buy Now
            </button>
          </div>
        </div>
      </div>
      
      {showQuickView && <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />}
    </>
  );
};
