
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { BarChart3, Users, ShoppingBag, DollarSign, TrendingUp, Package, Bell, Search, Settings, Image as ImageIcon, Upload, Trash2, Home, CheckSquare, Square, Edit, Layers, Tag, X, Check, Menu } from 'lucide-react';
import { useImage } from '../services/ImageContext';
import { useProduct } from '../services/ProductContext';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Order, User } from '../types';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { customImages, uploadImage, removeImage, getProductImage } = useImage();
  const { products, bulkUpdateProducts } = useProduct();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'price' | 'stock' | 'category' | null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');

  const filteredProducts = useMemo(() => products.filter(p => 
    p.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  // Derived categories for dropdown
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const usersQuery = query(collection(db, 'users'));
        const [ordersSnap, usersSnap] = await Promise.all([
          getDocs(ordersQuery),
          getDocs(usersQuery)
        ]);
        setOrders(ordersSnap.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as Order)));
        setCustomers(usersSnap.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as User)));
      } catch (error) {
        console.error("Failed to load admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const last24Hours = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return orders.filter(order => order.createdAt >= dayAgo);
  }, [orders]);
  const avgOrderValue = useMemo(() => (orders.length > 0 ? totalRevenue / orders.length : 0), [orders.length, totalRevenue]);

  // Handlers
  const handleFileClick = (productId: string) => {
    setSelectedProductId(productId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProductId) {
      await uploadImage(selectedProductId, file);
      setSelectedProductId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const applyBulkAction = () => {
    if (selectedIds.size === 0) return;

    if (bulkAction === 'price') {
      const price = parseFloat(bulkValue);
      if (!isNaN(price) && price > 0) {
        bulkUpdateProducts(Array.from(selectedIds), { price });
      }
    } else if (bulkAction === 'stock') {
      const inStock = bulkValue === 'in_stock';
      bulkUpdateProducts(Array.from(selectedIds), { inStock });
    } else if (bulkAction === 'category') {
      if (bulkValue) {
        bulkUpdateProducts(Array.from(selectedIds), { category: bulkValue });
      }
    }

    // Reset
    setSelectedIds(new Set());
    setBulkAction(null);
    setBulkValue('');
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 h-screen w-64 bg-leaf-900 text-white flex-shrink-0 flex flex-col p-6 z-40 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold flex items-center gap-2">Fresh<span className="text-leaf-400">Admin</span></h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-white/10"><X size={20}/></button>
        </div>
        
        <nav className="space-y-2 flex-grow">
           <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-leaf-100 hover:bg-white/5'}`}>
             <BarChart3 size={20}/> Dashboard
           </button>
           <button onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-white/10 text-white' : 'text-leaf-100 hover:bg-white/5'}`}>
             <Package size={20}/> Product Management
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-leaf-100 hover:bg-white/5 rounded-xl transition"><ShoppingBag size={20}/> Orders</button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-leaf-100 hover:bg-white/5 rounded-xl transition"><Users size={20}/> Customers</button>
        </nav>
        <div className="mt-auto pt-6 border-t border-leaf-700">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-leaf-400 flex items-center justify-center font-bold text-leaf-900">A</div>
             <div>
               <p className="text-sm font-bold">Admin User</p>
               <p className="text-xs text-leaf-300">Store Owner</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto h-screen relative w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-white border border-gray-200 rounded-lg text-gray-700 shadow-sm"><Menu size={20}/></button>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{activeTab === 'overview' ? 'Dashboard Overview' : 'Product Management'}</h1>
                <p className="text-gray-500 text-sm md:text-base">{activeTab === 'overview' ? "Welcome back, here's what's happening today." : "Manage products, update stock, and prices in bulk."}</p>
             </div>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
              <a href="/" className="flex items-center gap-2 text-sm font-bold text-leaf-600 hover:bg-leaf-50 px-3 py-2 rounded-lg transition ml-auto md:ml-0"><Home size={18}/> <span className="hidden sm:inline">View Site</span></a>
              <button className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><Bell size={20}/></button>
              <button className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><Settings size={20}/></button>
           </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="animate-in fade-in duration-500">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Revenue', value: `₹${Math.round(totalRevenue)}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Orders (24h)', value: `${last24Hours.length}`, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Total Customers', value: `${customers.length}`, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                       <stat.icon size={24} />
                     </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
                      <div>
                        <p className="text-sm font-bold text-gray-800">Order #{order.id}</p>
                        <p className="text-xs text-gray-400">{order.date} • {order.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">₹{order.total}</p>
                        <p className="text-[10px] font-bold uppercase text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 pb-24">
            {/* Product Manager UI */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-grow md:w-96">
                     <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                     <input 
                      type="text" 
                      placeholder="Search products by name..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-leaf-500 transition" 
                     />
                  </div>
                  <button 
                    onClick={selectAll}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition"
                  >
                    {selectedIds.size === filteredProducts.length ? <CheckSquare size={18}/> : <Square size={18}/>} 
                    <span className="hidden sm:inline">Select All</span>
                  </button>
                </div>
                
                <div className="flex gap-2">
                   <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                     <Package size={16} /> {filteredProducts.length} Products
                   </div>
                   <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                     <ImageIcon size={16} /> {Object.keys(customImages).length} Images
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const hasCustom = !!customImages[product.id];
                  const displayImage = getProductImage(product.id, product.image);
                  const isSelected = selectedIds.has(product.id);

                  return (
                    <div key={product.id} className={`border rounded-2xl overflow-hidden group hover:shadow-lg transition bg-white relative ${isSelected ? 'border-leaf-500 ring-2 ring-leaf-200' : 'border-gray-200'}`}>
                      {/* Selection Checkbox */}
                      <button 
                        onClick={() => toggleSelection(product.id)}
                        className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-leaf-600 text-white' : 'bg-white/80 text-gray-400 hover:text-gray-900'}`}
                      >
                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>

                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img 
                          src={displayImage} 
                          alt={product.name.en} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        {hasCustom && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            Custom Img
                          </span>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                             <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Out of Stock</span>
                          </div>
                        )}
                        
                        {/* Image Upload Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                            onClick={() => handleFileClick(product.id)}
                            className="bg-white text-gray-900 p-2 rounded-full hover:bg-leaf-500 hover:text-white transition shadow-lg" 
                            title="Upload New Image"
                           >
                             <Upload size={20} />
                           </button>
                           {hasCustom && (
                             <button 
                              onClick={() => removeImage(product.id)}
                              className="bg-white text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-lg"
                              title="Reset to Default Image"
                             >
                               <Trash2 size={20} />
                             </button>
                           )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 truncate" title={product.name.en}>{product.name.en}</h3>
                        <div className="flex justify-between items-center mb-2">
                           <p className="text-xs text-gray-500 font-medium">{product.category}</p>
                           <p className="text-sm font-bold text-leaf-700">₹{product.price}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                           <button 
                            onClick={() => handleFileClick(product.id)}
                            className="py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-500 text-xs font-bold hover:border-leaf-500 hover:text-leaf-600 hover:bg-leaf-50 transition flex items-center justify-center gap-1"
                           >
                             <Upload size={12} /> Image
                           </button>
                           <button 
                            onClick={() => { setSelectedIds(new Set([product.id])); setBulkAction('price'); }}
                            className="py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition flex items-center justify-center gap-1"
                           >
                             <Edit size={12} /> Edit
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            {/* Bulk Action Floating Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-bottom-6 max-w-2xl w-[95%] border border-gray-700">
                <div className="flex items-center gap-3 pr-4 md:border-r border-gray-700">
                  <div className="bg-leaf-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                    {selectedIds.size}
                  </div>
                  <span className="font-bold text-sm">Selected</span>
                  <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-white"><X size={16}/></button>
                </div>

                <div className="flex-grow flex flex-wrap items-center gap-3">
                  {!bulkAction ? (
                    <>
                      <span className="text-sm text-gray-400 mr-2">Choose Action:</span>
                      <button onClick={() => setBulkAction('price')} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition">
                        <DollarSign size={16} /> Update Price
                      </button>
                      <button onClick={() => setBulkAction('stock')} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition">
                        <Layers size={16} /> Update Stock
                      </button>
                      <button onClick={() => setBulkAction('category')} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition">
                        <Tag size={16} /> Update Category
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto animate-in fade-in">
                      <button onClick={() => setBulkAction(null)} className="text-gray-400 hover:text-white mr-2"><X size={16}/></button>
                      
                      {bulkAction === 'price' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">Set Price: ₹</span>
                          <input 
                            type="number" 
                            value={bulkValue} 
                            onChange={(e) => setBulkValue(e.target.value)}
                            placeholder="0.00"
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white w-24 focus:outline-none focus:border-leaf-500"
                            autoFocus
                          />
                        </div>
                      )}

                      {bulkAction === 'stock' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">Status:</span>
                          <select 
                            value={bulkValue}
                            onChange={(e) => setBulkValue(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-leaf-500"
                          >
                            <option value="">Select...</option>
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                          </select>
                        </div>
                      )}

                      {bulkAction === 'category' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">Category:</span>
                          <select 
                            value={bulkValue}
                            onChange={(e) => setBulkValue(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-leaf-500 max-w-[150px]"
                          >
                            <option value="">Select...</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                      )}

                      <button 
                        onClick={applyBulkAction}
                        disabled={!bulkValue}
                        className="bg-leaf-600 hover:bg-leaf-500 text-white px-4 py-2 rounded-lg font-bold text-sm ml-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={16} /> Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
