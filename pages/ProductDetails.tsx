
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, Shield, Minus, Plus, MapPin, CheckCircle, ArrowLeft, Info, Heart, XCircle } from 'lucide-react';
import { useProduct } from '../services/ProductContext';
import { useCart } from '../services/CartContext';
import { useImage } from '../services/ImageContext';
import { usePincode } from '../services/PincodeContext';
import { ProductCard } from '../components/ui/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProduct();
  const product = products.find(p => p.id === id);
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const { getProductImage } = useImage();
  const { pincode, isServiceable, setPincode } = usePincode();
  
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');
  const [checkPincodeInput, setCheckPincodeInput] = useState(pincode || '');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'serviceable' | 'unserviceable'>(pincode ? (isServiceable ? 'serviceable' : 'unserviceable') : 'idle');

  // Determine initial main image (custom image takes precedence)
  const defaultImage = product?.gallery[0] || product?.image || '';
  const customImage = product ? getProductImage(product.id, defaultImage) : '';
  const [mainImage, setMainImage] = useState(customImage);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (!product) return <div className="p-20 text-center">Product not found</div>;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
      e.preventDefault();
      if(checkPincodeInput.length !== 6) return;
      
      setPincodeStatus('checking');
      const success = await setPincode(checkPincodeInput);
      setPincodeStatus(success ? 'serviceable' : 'unserviceable');
  };

  // Mock Nutrition Data Generator
  const nutritionData = [
    { label: 'Calories', value: '52 kcal' },
    { label: 'Carbohydrates', value: '14 g' },
    { label: 'Protein', value: '0.3 g' },
    { label: 'Total Fat', value: '0.2 g' },
    { label: 'Dietary Fiber', value: '2.4 g' },
    { label: 'Vitamin C', value: '14% DV' },
    { label: 'Potassium', value: '107 mg' },
  ];

  // Mock Reviews
  const reviews = [
    { id: 1, user: 'Riya S.', rating: 5, date: '2 days ago', comment: 'Absolutely fresh and crunchy! My kids loved it.' },
    { id: 2, user: 'Amit K.', rating: 4, date: '1 week ago', comment: 'Good quality but delivery was slightly delayed.' },
    { id: 3, user: 'Sneha P.', rating: 5, date: '2 weeks ago', comment: 'Best organic produce I have found online.' },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-leaf-600 font-bold transition">
            <ArrowLeft size={20} /> Back to Shop
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          <div className="flex flex-col md:flex-row">
            
            {/* Gallery Section */}
            <div className="md:w-1/2 p-6 md:p-10 bg-gray-50/50">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden aspect-square mb-6 relative group">
                <img src={mainImage} alt={product.name.en} className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" />
                {product.isOrganic && (
                   <span className="absolute top-4 left-4 bg-leaf-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Organic</span>
                )}
                <button 
                  onClick={toggleWishlist}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all ${isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              
              {/* Thumbnails - Only show if more than 1 image */}
              {product.gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                      onClick={() => setMainImage(getProductImage(product.id, product.image))}
                      className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === getProductImage(product.id, product.image) ? 'border-leaf-500 scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={getProductImage(product.id, product.image)} alt="" className="w-full h-full object-cover" />
                  </button>

                  {product.gallery.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-leaf-500 scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
              <div className="mb-2 flex items-center gap-2">
                 <span className="text-xs font-bold bg-leaf-100 text-leaf-700 px-2 py-1 rounded uppercase tracking-wide">{product.category}</span>
                 {product.inStock ? (
                   <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={12}/> In Stock</span>
                 ) : (
                   <span className="text-xs font-bold text-red-500">Out of Stock</span>
                 )}
              </div>
              
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name.en}</h1>
              <p className="text-xl text-gray-500 mb-6 font-hindi">{product.name.hi} | {product.name.bn}</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-gray-400 text-sm font-medium border-l border-gray-300 pl-4">
                  {product.reviews} Verified Reviews
                </span>
              </div>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="text-5xl font-extrabold text-gray-900">
                  {formatPrice(product.price)}
                  <span className="text-lg text-gray-400 font-medium ml-1">/{product.baseUnit}</span>
                </div>
                {product.oldPrice && (
                  <div className="mb-2">
                     <span className="text-xl text-gray-400 line-through block">{formatPrice(product.oldPrice)}</span>
                     <span className="text-sm font-bold text-red-500">
                       {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                     </span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {product.description} Sourced directly from verified organic farms. Handpicked for quality and freshness.
              </p>

              {/* Delivery Checker */}
              <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Check Delivery</p>
                  <form onSubmit={handleCheckPincode} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter Pincode" 
                        maxLength={6}
                        value={checkPincodeInput}
                        onChange={(e) => setCheckPincodeInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-grow bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-leaf-500"
                      />
                      <button type="submit" className="text-leaf-600 font-bold text-sm px-3 hover:bg-leaf-50 rounded-lg transition">Check</button>
                  </form>
                  {pincodeStatus === 'serviceable' && (
                      <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Delivery available to {pincode}</p>
                  )}
                  {pincodeStatus === 'unserviceable' && (
                      <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1"><XCircle size={12}/> Not serviceable currently</p>
                  )}
              </div>

              {/* Actions */}
              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-2xl bg-gray-50 h-14">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-14 h-full flex items-center justify-center hover:bg-gray-200 rounded-l-2xl transition"><Minus size={20}/></button>
                    <span className="px-4 font-bold text-xl min-w-[3rem] text-center text-gray-900">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-14 h-full flex items-center justify-center hover:bg-gray-200 rounded-r-2xl transition"><Plus size={20}/></button>
                  </div>
                  <button 
                    onClick={() => {
                        const cartProduct = { ...product, image: getProductImage(product.id, product.image) };
                        addToCart(cartProduct, qty);
                    }}
                    disabled={!product.inStock}
                    className={`flex-grow text-white h-14 rounded-2xl font-bold text-lg transition shadow-xl active:scale-95 flex items-center justify-center gap-2 ${product.inStock ? 'bg-gray-900 hover:bg-leaf-600 shadow-leaf-500/20' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Truck size={24} className="text-leaf-600 mb-2"/>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Delivery</p>
                    <p className="text-xs font-bold text-gray-900">24 Hours</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Shield size={24} className="text-leaf-600 mb-2"/>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Safety</p>
                    <p className="text-xs font-bold text-gray-900">Certified</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <MapPin size={24} className="text-leaf-600 mb-2"/>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Source</p>
                    <p className="text-xs font-bold text-gray-900">Local Farm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {['description', 'nutrition', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === tab ? 'bg-leaf-600 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-8 min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Product Details</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Our {product.name.en} is grown using sustainable farming practices without harmful pesticides. 
                      Harvested at peak ripeness to ensure maximum flavor and nutritional value. 
                      Perfect for healthy snacking, cooking, or juicing.
                    </p>
                    <h4 className="font-bold text-gray-900 mb-3">Storage Tips</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                      <li>Keep in a cool, dry place away from direct sunlight.</li>
                      <li>Refrigerate to extend shelf life up to 1 week.</li>
                      <li>Wash thoroughly before consumption.</li>
                    </ul>
                  </div>
                )}
                
                {activeTab === 'nutrition' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nutrition Facts</h3>
                    <p className="text-sm text-gray-500 mb-6">Per 100g serving</p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {nutritionData.map((item, idx) => (
                        <div key={idx} className={`flex justify-between p-4 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <span className="font-medium text-gray-700">{item.label}</span>
                          <span className="font-bold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                      <button className="text-sm font-bold text-leaf-600 hover:underline">Write a Review</button>
                    </div>
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">{review.user[0]}</div>
                            <span className="font-bold text-gray-900">{review.user}</span>
                          </div>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-leaf-50 p-8 rounded-3xl border border-leaf-100 h-full">
               <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Info className="text-leaf-600" /> Why FreshLeaf?
               </h3>
               <ul className="space-y-6">
                 <li className="flex gap-4">
                   <div className="bg-white p-2 rounded-full shadow-sm h-fit"><CheckCircle size={20} className="text-green-500" /></div>
                   <div>
                     <h4 className="font-bold text-gray-800 text-sm">Farm to Fork</h4>
                     <p className="text-xs text-gray-600 mt-1">Directly sourced from farmers within 24 hours.</p>
                   </div>
                 </li>
                 <li className="flex gap-4">
                   <div className="bg-white p-2 rounded-full shadow-sm h-fit"><CheckCircle size={20} className="text-green-500" /></div>
                   <div>
                     <h4 className="font-bold text-gray-800 text-sm">No Chemicals</h4>
                     <p className="text-xs text-gray-600 mt-1">100% pesticide-free and organic certified.</p>
                   </div>
                 </li>
                 <li className="flex gap-4">
                   <div className="bg-white p-2 rounded-full shadow-sm h-fit"><CheckCircle size={20} className="text-green-500" /></div>
                   <div>
                     <h4 className="font-bold text-gray-800 text-sm">Hygiene Packed</h4>
                     <p className="text-xs text-gray-600 mt-1">Sanitized and vacuum packed for safety.</p>
                   </div>
                 </li>
               </ul>
             </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
