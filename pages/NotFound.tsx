import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="mb-8 relative inline-block">
           {/* Animated Veggie SVG placeholder or similar */}
           <div className="text-9xl font-extrabold text-leaf-200">404</div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">🥑</div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Oh kale no!</h1>
        <p className="text-xl text-gray-600 mb-8">
          The page you are looking for has either been eaten or doesn't exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="bg-leaf-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-leaf-700 transition shadow-lg shadow-leaf-200">
            <Home size={20} /> Back Home
          </Link>
          <Link to="/shop" className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition">
            <ArrowLeft size={20} /> Go Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
