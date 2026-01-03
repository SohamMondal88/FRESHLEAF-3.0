
import React, { useState } from 'react';
import { useCart } from '../services/CartContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart, ArrowLeft, X, AlertTriangle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useCart();
  const [confirmRemove, setConfirmRemove] = useState<Product | null>(null);

  const handleWishlistClick = (product: Product) => {
    setConfirmRemove(product);
  };

  const confirmRemoval = () => {
    if (confirmRemove) {
        removeFromWishlist(confirmRemove.id);
        setConfirmRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] py-12 relative font-sans">
      
      {/* Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <button 
              onClick={() => setConfirmRemove(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex justify-center mb-6">
               <div className="bg-red-50 p-4 rounded-full shadow-inner">
                 <AlertTriangle size={32} className="text-red-500" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Remove Item?</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed text-sm">
              Are you sure you want to remove <br/><span className="font-bold text-gray-800 text-base">"{confirmRemove.name.en}"</span> from your wishlist?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmRemove(null)} 
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95"
              >
                Keep It
              </button>
              <button 
                onClick={confirmRemoval} 
                className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-4">
              <Link to="/account" className="p-3 bg-white rounded-full text-gray-600 hover:text-leaf-600 hover:shadow-md transition border border-gray-100 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">My Wishlist</h1>
                <p className="text-gray-500 text-sm mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later</p>
              </div>
           </div>
           
           {wishlist.length > 0 && (
             <Link to="/shop" className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm hover:border-leaf-500 hover:text-leaf-600 transition shadow-sm">
                <ShoppingBag size={16}/> Continue Shopping
             </Link>
           )}
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] shadow-sm border border-gray-100 animate-in zoom-in-95 duration-500 mx-auto max-w-3xl text-center px-6">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
               <Heart size={40} className="text-red-400" />
               <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg leading-relaxed">
              Looks like you haven't found your favorites yet. Explore our fresh harvest and save items you love.
            </p>
            <Link to="/shop" className="bg-leaf-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-leaf-700 transition shadow-xl shadow-leaf-200 hover:-translate-y-1 transform">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {wishlist.map((product, idx) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                <ProductCard 
                  product={product} 
                  onWishlistClick={handleWishlistClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
