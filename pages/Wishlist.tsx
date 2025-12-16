import React from 'react';
import { useCart } from '../services/CartContext';
import { ProductCard } from '../components/ui/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlist } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};