
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, Minus, Plus, Zap, ChevronLeft, ChevronRight, Zap as BuyIcon, Sprout, ShoppingBag } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const unitOptions = getUnitOptions(product.baseUnit);
  const defaultUnitIndex = product.baseUnit === 'kg' ? 2 : 0;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(defaultUnitIndex);

  const currentMultiplier = unitOptions[selectedUnitIdx].multiplier;
  const unitLabel = unitOptions[selectedUnitIdx].label;
  const displayPrice = Math.ceil(product.price * currentMultiplier);
  const oldDisplayPrice = product.oldPrice ? Math.ceil(product.oldPrice * currentMultiplier) : null;

  const displayImage = getProductImage(product.id, product.gallery[currentImageIndex] || product.image);
  
  const farmer = FARMERS.find(f => f.id === product.sellerId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ ...product, image: getProductImage(product.id, product.image) }, qty, unitLabel, displayPrice);
    setQty(1);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    // Default to 1 unit of standard size
    const defaultOpt = unitOptions[defaultUnitIndex];
    addToCart(
        { ...product, image: getProductImage(product.id, product.image) }, 
        1, 
        defaultOpt.label, 
        Math.ceil(product.price * defaultOpt.multiplier)
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ ...product, image: getProductImage(product.id, product.image) }, qty, unitLabel, displayPrice);
    navigate('/checkout');
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (onWishlistClick) {
        onWishlistClick(product);
    } else {
        isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setShowQuickView(true);
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
        className="bg-white rounded-3xl shadow-soft hover:shadow-card-hover transition-all duration-500 transform hover:-translate-y-2 relative group overflow-hidden border border-gray-100 flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative block aspect-[4/3] overflow-hidden bg-white rounded-t-3xl border-b border-gray-50">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img src={displayImage} alt={product.name.en} className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" />
          </Link>
          
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.isOrganic && <span className="bg-leaf-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">Organic</span>}
          </div>

          {/* Action Buttons (Wishlist, Quick View, Quick Add) */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 z-20 transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 lg:translate-x-4'}`}>
            <button 
                onClick={toggleWishlist} 
                className={`p-2.5 rounded-full shadow-md transition-all duration-300 ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'}`}
                title="Add to Wishlist"
            >
                <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
            </button>
            <button 
                onClick={handleQuickView}
                className="p-2.5 rounded-full shadow-md bg-white text-gray-400 hover:text-leaf-600 hover:scale-110 transition-all duration-300"
                title="Quick View"
            >
                <Eye size={18} />
            </button>
            <button 
                onClick={handleQuickAdd}
                className="p-2.5 rounded-full shadow-md bg-leaf-600 text-white hover:bg-leaf-700 hover:scale-110 transition-all duration-300"
                title="Quick Add 1 Unit"
            >
                <ShoppingBag size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <Link to={`/product/${product.id}`} className="block mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-1 group-hover:text-leaf-700 transition-colors">{renderHighlightedText(product.name.en, highlightTerm)}</h3>
            <div className="flex gap-2 items-center mt-1">
               <span className="text-xs font-bold text-leaf-700 bg-leaf-50 px-2 py-0.5 rounded font-hindi border border-leaf-100">{product.name.bn}</span>
               <span className="text-xs font-medium text-gray-400">|</span>
               <span className="text-xs text-gray-500 font-hindi">{product.name.hi}</span>
            </div>
          </Link>

          {/* Farmer Link */}
          {farmer && (
             <Link to={`/farmer/${farmer.id}`} className="flex items-center gap-1.5 mb-3 group/farmer">
                <Sprout size={12} className="text-leaf-500"/>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover/farmer:text-leaf-600 transition-colors">Sold by {farmer.name.split(' ')[0]}</span>
             </Link>
          )}
          
          <div className="mb-4">
            <div className="relative bg-gray-100/80 rounded-lg p-0.5 flex items-center shadow-inner">
              <div className="absolute top-0.5 bottom-0.5 bg-white shadow-sm rounded-md border border-gray-200 transition-all duration-300 z-0" style={{ left: `calc(${(selectedUnitIdx / unitOptions.length) * 100}%)`, width: `calc(${100 / unitOptions.length}%)` }} />
              <div className="flex w-full relative z-10">
                {unitOptions.map((opt, idx) => (
                  <button key={opt.label} onClick={(e) => { e.preventDefault(); setSelectedUnitIdx(idx); }} className={`flex-1 text-[10px] font-bold text-center py-1.5 transition-colors rounded-md ${selectedUnitIdx === idx ? 'text-leaf-800' : 'text-gray-500'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                 <span className="font-extrabold text-xl text-gray-900">₹{displayPrice}</span>
                 {oldDisplayPrice && <span className="text-xs text-gray-400 line-through">₹{oldDisplayPrice}</span>}
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                  <button onClick={(e) => { e.preventDefault(); setQty(Math.max(1, qty - 1)); }} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm transition-all hover:bg-gray-100 active:scale-95" disabled={qty <= 1}><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                  <button onClick={(e) => { e.preventDefault(); setQty(qty + 1); }} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm transition-all hover:bg-gray-100 active:scale-95"><Plus size={14} /></button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleAddToCart} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95">
                <ShoppingCart size={14} /> Add
              </button>
              <button onClick={handleBuyNow} className="flex-[1.5] bg-gradient-to-r from-gray-900 to-gray-800 hover:from-leaf-700 hover:to-leaf-600 text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-leaf-500/30 active:scale-95 group relative overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:animate-pulse"></span>
                <BuyIcon size={14} className="relative z-10" /> <span className="relative z-10">Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showQuickView && <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />}
    </>
  );
};
