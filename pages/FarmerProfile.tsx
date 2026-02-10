
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, ArrowLeft, CheckCircle, ShieldCheck, Sprout } from 'lucide-react';
import { useFarmer } from '../services/FarmerContext';
import { useProduct } from '../services/ProductContext';
import { ProductCard } from '../components/ui/ProductCard';

export const FarmerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading } = useFarmer();
  const { products } = useProduct();
  const farmer = farmers.find(f => f.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-leaf-200 border-t-leaf-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!farmer) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Farmer Not Found</h2>
            <button onClick={() => navigate('/shop')} className="text-leaf-600 font-bold hover:underline">Back to Shop</button>
        </div>
    );
  }

  const farmerProducts = products.filter(p => p.sellerId === farmer.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden">
         <img src={farmer.coverImage} alt={farmer.farmName} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
         <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition">
            <ArrowLeft size={24}/>
         </button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
         <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar & Badges */}
            <div className="flex-shrink-0 text-center w-full md:w-auto">
               <div className="relative inline-block">
                  <img src={farmer.avatar} alt={farmer.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200" />
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border-4 border-white"><CheckCircle size={16} fill="currentColor" className="text-white"/></div>
               </div>
               <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-[200px] mx-auto">
                  {farmer.certifications.map(cert => (
                      <span key={cert} className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck size={10}/> {cert}
                      </span>
                  ))}
               </div>
            </div>

            {/* Info */}
            <div className="flex-grow">
               <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{farmer.farmName}</h1>
               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-wide mb-6">
                  <span className="flex items-center gap-1"><Sprout size={16} className="text-leaf-500"/> {farmer.name}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1"><MapPin size={16} className="text-leaf-500"/> {farmer.location}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1 text-yellow-500"><Star size={16} fill="currentColor"/> {farmer.rating} Rating</span>
               </div>
               
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">About the Farm</h3>
                  <p className="text-gray-600 leading-relaxed">{farmer.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <Calendar size={14}/> Partner since {farmer.joinedDate}
                  </div>
               </div>
            </div>
         </div>

         {/* Products Grid */}
         <div className="mt-12">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-leaf-100 p-2 rounded-xl text-leaf-600"><Sprout size={24}/></div>
               <h2 className="text-3xl font-extrabold text-gray-900">Fresh Harvests</h2>
               <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{farmerProducts.length} Items</span>
            </div>

            {farmerProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {farmerProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                    <p className="text-gray-400">No products listed currently.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
