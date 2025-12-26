import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye, Minus, Plus, Zap, ChevronLeft, ChevronRight, Zap as BuyIcon } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../services/CartContext';
import { useImage } from '../../services/ImageContext';
import { QuickViewModal } from './QuickViewModal';

interface Props {
  product: Product;
  highlightTerm?: string;
}

// Generate units based on product baseUnit
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

export const ProductCard: React.FC<Props> = ({ product, highlightTerm }) => {
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const { getProductImage } = useImage();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const unitOptions = getUnitOptions(product.baseUnit);
  
  // Default to 3rd option (1kg) if kg, else 1st option
  const defaultUnitIndex = product.baseUnit === 'kg' ? 2 : 0;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(defaultUnitIndex);

  const currentMultiplier = unitOptions[selectedUnitIdx].multiplier;
  const unitLabel = unitOptions[selectedUnitIdx].label;
  const displayPrice = Math.ceil(product.price * currentMultiplier);
  const oldDisplayPrice = product.oldPrice ? Math.ceil(product.oldPrice * currentMultiplier) : null;
  const totalPrice = displayPrice * qty;

  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  // Use the custom image from context if available, otherwise use gallery or main image
  const displayImage = getProductImage(product.id, product.gallery[currentImageIndex] || product.image);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartProduct = { ...product, image: getProductImage(product.id, product.image) };
    addToCart(cartProduct, qty, unitLabel, displayPrice);
    setQty(1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartProduct = { ...product, image: getProductImage(product.id, product.image) };
    addToCart(cartProduct, qty, unitLabel, displayPrice);
    navigate('/checkout');
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.gallery.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.gallery.length) % product.gallery.length);
  };

  // Helper for highlighting text
  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight || !highlight.trim()) return text;
    
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-300 text-gray-900 rounded-sm px-0.5 shadow-sm">{part}</span>
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
        {/* Product Image Gallery Area */}
        <div className="relative block aspect-[4/3] overflow-hidden bg-gray-100 rounded-t-3xl">
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={displayImage}
              alt={product.name.en}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          
          {/* Gallery Controls */}
          {product.gallery.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md text-gray-700 hover:bg-white transition-all duration-300 z-20 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={nextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md text-gray-700 hover:bg-white transition-all duration-300 z-20 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {product.gallery.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'}`} 
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.inStock && (
              <span className="bg-white/90 backdrop-blur-md text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Stock
              </span>
            )}
            {product.isOrganic && (
              <span className="bg-leaf-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-leaf-600">
                Organic
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-red-600">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Action */}
          <button 
            onClick={toggleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 z-20 ${isInWishlist(product.id) ? 'bg-red-50 text-red-500 scale-110' : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 hover:scale-110'} ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
            title="Add to Wishlist"
          >
            <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>

          {/* Quick View Action */}
          <button 
            onClick={handleQuickView}
            className={`absolute top-14 right-3 p-2 rounded-full shadow-lg transition-all duration-300 z-20 delay-75 bg-white text-gray-400 hover:bg-leaf-50 hover:text-leaf-600 hover:scale-110 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
            title="Quick View"
          >
            <Eye size={18} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-5 flex-grow flex flex-col relative">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-[10px] font-bold text-leaf-700 bg-leaf-50 border border-leaf-100 px-2 py-0.5 rounded-md uppercase tracking-wide">{product.category}</span>
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
               <Star size={10} className="text-yellow-500" fill="currentColor" />
               <span className="text-[10px] font-bold text-yellow-700">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <Link to={`/product/${product.id}`} className="block mb-3">
            <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-leaf-700 transition-colors line-clamp-1" title={product.name.en}>
              {renderHighlightedText(product.name.en, highlightTerm)}
            </h3>
            <p className="text-xs text-gray-500 font-medium truncate font-hindi mt-1">
              {renderHighlightedText(product.name.hi, highlightTerm)} <span className="text-gray-300 mx-1">|</span> {renderHighlightedText(product.name.bn, highlightTerm)}
            </p>
          </Link>
          
          {/* Advanced Unit Selector */}
          <div className="mb-4">
            <div className="relative bg-gray-100/80 rounded-lg p-0.5 flex items-center shadow-inner">
              <div 
                className="absolute top-0.5 bottom-0.5 bg-white shadow-sm rounded-md border border-gray-200 transition-all duration-300 ease-out z-0"
                style={{ 
                  left: `calc(${(selectedUnitIdx / unitOptions.length) * 100}%)`, 
                  width: `calc(${100 / unitOptions.length}%)` 
                }} 
              />
              
              <div className="flex w-full relative z-10">
                {unitOptions.map((opt, idx) => (
                  <button
                    key={opt.label}
                    onClick={(e) => { e.preventDefault(); setSelectedUnitIdx(idx); }}
                    className={`flex-1 text-[10px] font-bold text-center py-1.5 transition-colors duration-200 rounded-md ${
                      selectedUnitIdx === idx 
                        ? 'text-leaf-800' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                 <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Price</span>
                 <div className="flex items-baseline gap-2">
                   <span className="font-extrabold text-xl text-gray-900">₹{displayPrice}</span>
                   {oldDisplayPrice && (
                     <span className="text-xs text-gray-400 line-through">₹{oldDisplayPrice}</span>
                   )}
                 </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5 shadow-sm">
                  <button 
                    onClick={(e) => { e.preventDefault(); setQty(Math.max(1, qty - 1)); }} 
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all active:scale-90"
                    disabled={qty <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-900 tabular-nums">{qty}</span>
                  <button 
                    onClick={(e) => { e.preventDefault(); setQty(qty + 1); }} 
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-gray-600 hover:text-leaf-600 hover:bg-leaf-50 shadow-sm transition-all active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
              </div>
            </div>

            {/* Action Footer - Now with Buy Now button */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-gray-200"
                title="Add to Cart"
              >
                <ShoppingCart size={14} /> Add
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-[1.5] bg-gray-900 hover:bg-leaf-600 text-white h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-gray-200 hover:shadow-leaf-500/30 active:scale-95 group"
              >
                <BuyIcon size={14} className="group-hover:fill-current" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal 
          product={product} 
          onClose={() => setShowQuickView(false)} 
        />
      )}
    </>
  );
};