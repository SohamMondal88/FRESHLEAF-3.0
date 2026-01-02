
import React, { useState } from 'react';
import { useCart } from '../services/CartContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useCart();
  const [confirmRemove, setConfirmRemove] = useState<Product | null>(null);

  const handleWishlistClick = (product: Product) => {
    // Only trigger confirmation if we are removing
    setConfirmRemove(product);
  };

  const confirmRemoval = () => {
    if (confirmRemove) {
        removeFromWishlist(confirmRemove.id);
        setConfirmRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      
      {/* Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 relative">
            <button 
              onClick={() => setConfirmRemove(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-4">
               <div className="bg-red-50 p-4 rounded-full animate-bounce">
                 <AlertTriangle size={32} className="text-red-500" />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Remove from Wishlist?</h3>
            <p className="text-gray-500 mb-8 text-center leading-relaxed">
              Are you sure you want to remove <br/><span className="font-bold text-gray-800">{confirmRemove.name.en}</span>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmRemove(null)} 
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoval} 
                className="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-200"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
           <Link to="/account" className="p-2 bg-white rounded-full text-gray-600 hover:text-leaf-600 transition"><ArrowLeft size={20}/></Link>
           <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Heart size={32} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you want to buy later.</p>
            <Link to="/shop" className="bg-leaf-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-leaf-700 transition">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onWishlistClick={handleWishlistClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
