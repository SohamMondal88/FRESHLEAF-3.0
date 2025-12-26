import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Minus, Plus, ShoppingCart, CheckCircle, Zap as BuyIcon } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../services/CartContext';
import { useImage } from '../../services/ImageContext';
import { Link, useNavigate } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { getProductImage } = useImage();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  
  // Default unit logic similar to ProductCard
  const unitLabel = product.baseUnit === 'kg' ? '1kg' : `1 ${product.baseUnit}`;
  const [selectedUnit, setSelectedUnit] = useState(unitLabel);

  const displayImage = getProductImage(product.id, product.image);

  // Helper to format price
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    addToCart(product, qty, selectedUnit, product.price);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, qty, selectedUnit, product.price);
    onClose();
    navigate('/checkout');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleOverlayClick}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-red-500 shadow-sm"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative min-h-[300px]">
           <img 
             src={displayImage} 
             alt={product.name.en} 
             className="w-full h-full object-contain max-h-[400px] drop-shadow-xl" 
           />
           {product.isOrganic && (
             <span className="absolute top-6 left-6 bg-leaf-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Organic</span>
           )}
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-8 flex flex-col h-full overflow-y-auto">
          <div className="mb-2">
             <span className="text-xs font-bold text-leaf-600 bg-leaf-50 px-2 py-1 rounded uppercase tracking-wide">{product.category}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name.en}</h2>
          <p className="text-sm text-gray-500 font-hindi mb-4">{product.name.hi} | {product.name.bn}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-gray-400 text-sm font-medium">({product.reviews} reviews)</span>
          </div>

          <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="text-4xl font-extrabold text-gray-900">
              {formatPrice(product.price)}
              <span className="text-base text-gray-400 font-medium ml-1">/{product.baseUnit}</span>
            </div>
            {product.oldPrice && (
               <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-auto space-y-4">
             {/* Quantity Selection */}
             <div className="flex items-center gap-4">
               <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 h-12">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-200 rounded-l-xl transition text-gray-600"><Minus size={18}/></button>
                  <span className="px-4 font-bold text-lg text-gray-900 w-12 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-12 h-full flex items-center justify-center hover:bg-gray-200 rounded-r-xl transition text-gray-600"><Plus size={18}/></button>
               </div>
               <div className="flex-grow flex gap-2">
                 <button 
                   onClick={handleAddToCart}
                   disabled={!product.inStock}
                   className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 border border-gray-200 transition-all active:scale-95 ${product.inStock ? 'bg-white text-gray-800 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                 >
                   <ShoppingCart size={18} /> Cart
                 </button>
                 <button 
                   onClick={handleBuyNow}
                   disabled={!product.inStock}
                   className={`flex-[1.5] h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 group ${product.inStock ? 'bg-gray-900 text-white hover:bg-leaf-600 shadow-leaf-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                 >
                   <BuyIcon size={18} className="group-hover:fill-current" /> Buy Now
                 </button>
               </div>
             </div>
             
             <div className="pt-4 text-center">
               <Link to={`/product/${product.id}`} onClick={onClose} className="text-sm font-bold text-gray-500 hover:text-leaf-600 hover:underline">View Full Details</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};