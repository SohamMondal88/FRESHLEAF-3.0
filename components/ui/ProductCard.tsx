
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, Minus, Plus, Zap as BuyIcon, Sprout, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../services/CartContext';
import { useImage } from '../../services/ImageContext';
import { QuickViewModal } from './QuickViewModal';
import { FARMERS } from '../../constants';

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
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const unitOptions = getUnitOptions(product.baseUnit);
  const defaultUnitIndex = product.baseUnit === 'kg' ? 2 : 0;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(defaultUnitIndex);

  const currentMultiplier = unitOptions[selectedUnitIdx].multiplier;
  const unitLabel = unitOptions[selectedUnitIdx].label;
  const displayPrice = Math.ceil(product.price * currentMultiplier);
  const oldDisplayPrice = product.oldPrice ? Math.ceil(product.oldPrice * currentMultiplier) : null;

  const displayImage = getProductImage(product.id, product.image);
  const farmer = FARMERS.find(f => f.id === product.sellerId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ ...product, image: displayImage }, qty, unitLabel, displayPrice);
    setQty(1);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
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

  return (
    <>
      <div 
        className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-leaf-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. Image Area (Top) */}
        <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
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
        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-3">
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

          {/* Description (Short) */}
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed h-8">
            {product.description}
          </p>

          {/* Unit Selector */}
          <div className="mt-auto mb-4">
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg overflow-x-auto scrollbar-hide">
              {unitOptions.map((opt, idx) => (
                <button 
                  key={opt.label} 
                  onClick={(e) => { e.preventDefault(); setSelectedUnitIdx(idx); }} 
                  className={`flex-1 min-w-[50px] text-[10px] font-bold py-1.5 rounded-md transition-all whitespace-nowrap ${selectedUnitIdx === idx ? 'bg-white text-leaf-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Action Area (Bottom) */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <div className="flex flex-col">
               <div className="flex items-baseline gap-1">
                 <span className="font-extrabold text-lg text-gray-900">₹{displayPrice}</span>
                 {oldDisplayPrice && <span className="text-xs text-gray-400 line-through">₹{oldDisplayPrice}</span>}
               </div>
               <span className="text-[10px] text-gray-400 font-medium">per {unitLabel}</span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="bg-gray-900 hover:bg-leaf-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95"
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {showQuickView && <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />}
    </>
  );
};
