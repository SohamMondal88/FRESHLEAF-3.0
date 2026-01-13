
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, TrendingUp, DollarSign, Plus, Image as ImageIcon, 
  Settings, LogOut, ChevronRight, Search, Sprout, ShoppingCart, Truck, 
  CheckCircle, AlertCircle, Printer, Calendar, Banknote, User, MapPin,
  Upload, Trash2, MoreVertical, Filter, Save, X, ChevronDown, ChevronUp, Menu,
  Sparkles, Loader2, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useProduct } from '../services/ProductContext';
import { useImage } from '../services/ImageContext';
import { useToast } from '../services/ToastContext';
import { useOrder } from '../services/OrderContext';
import { GoogleGenAI } from "@google/genai";

export const SellerDashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { products, addProduct, updateProduct, bulkUpdateProducts } = useProduct();
  const { orders, updateOrderStatus } = useOrder();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'payments' | 'settings' | 'add_product'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- STATE: Add Product ---
  const [newProduct, setNewProduct] = useState({
    nameEn: '', nameHi: '', nameBn: '', price: '', category: 'Vegetable',
    baseUnit: 'kg', description: '', stock: 100,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // --- STATE: Inventory Management ---
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // --- STATE: Settings ---
  const [farmSettings, setFarmSettings] = useState({
    farmName: user?.farmName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    upiId: 'seller@upi',
    accountNumber: 'XXXX-XXXX-8821',
    ifsc: 'HDFC0001234',
    address: user?.address || '',
  });

  // --- DERIVED DATA ---
  const myProducts = useMemo(() => {
    let filtered = products.filter(p => p.sellerId === user?.id);
    
    if (inventorySearch) {
      const lower = inventorySearch.toLowerCase();
      filtered = filtered.filter(p => p.name.en.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a];
        const bVal = b[sortConfig.key as keyof typeof b];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [products, user?.id, inventorySearch, sortConfig]);
  
  const mySalesData = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    const sellerOrders: any[] = [];

    if (!user) return { totalRevenue: 0, pendingCount: 0, sellerOrders: [] };

    orders.forEach(order => {
      const myItems = order.items.filter(item => item.sellerId === user.id);
      
      if (myItems.length > 0) {
        const orderRevenue = myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        totalRevenue += orderRevenue;
        
        if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
          pendingCount++;
        }

        sellerOrders.push({
          id: order.id,
          date: order.date,
          status: order.status,
          customer: order.customerName || 'Guest User',
          items: myItems,
          total: orderRevenue,
          payment: order.paymentMethod
        });
      }
    });

    return { totalRevenue, pendingCount, sellerOrders };
  }, [orders, user?.id]);

  // --- HANDLERS ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateDescription = async () => {
    if (!newProduct.nameEn) {
        addToast("Enter product name first", "error");
        return;
    }
    setAiLoading(true);
    try {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write a short, appealing 2-sentence description for selling "${newProduct.nameEn}" (${newProduct.category}) fresh from an organic farm. Highlight freshness and health benefits.`;
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const desc = result.text?.trim() || "";
        setNewProduct(prev => ({ ...prev, description: desc }));
        addToast("Description generated!", "success");
    } catch (e) {
        console.error(e);
        addToast("Failed to generate description", "error");
    } finally {
        setAiLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imagePreview) {
        addToast('Please upload a main product image', 'error');
        return;
    }
    if (!user) return;

    const finalMainImage = imagePreview || 'https://via.placeholder.com/150';
    const finalGallery = [finalMainImage]; 

    addProduct({
        name: { en: newProduct.nameEn, hi: newProduct.nameHi, bn: newProduct.nameBn },
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image: finalMainImage,
        gallery: finalGallery,
        description: newProduct.description,
        baseUnit: newProduct.baseUnit,
        inStock: newProduct.stock > 0,
        stock: newProduct.stock,
        sellerId: user.id,
        isLocal: true 
    });

    addToast('Product listed successfully!', 'success');
    setActiveTab('inventory');
    setNewProduct({ nameEn: '', nameHi: '', nameBn: '', price: '', category: 'Vegetable', baseUnit: 'kg', description: '', stock: 100 });
    setImageFile(null);
    setImagePreview(null);
  };

  const Chart = () => (
    <div className="relative h-64 w-full bg-white rounded-2xl p-4 flex items-end gap-2 overflow-hidden border border-gray-100">
        <div className="absolute top-4 left-4 text-xs font-bold text-gray-400">Revenue Trend (7 Days)</div>
        {[45, 60, 35, 70, 55, 80, 65].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer relative">
                <div 
                    className="w-full bg-leaf-100 rounded-t-lg transition-all duration-500 group-hover:bg-leaf-500 relative" 
                    style={{ height: `${h}%` }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ₹{h * 100}
                    </div>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-2 font-bold">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
            </div>
        ))}
    </div>
  );

  if (!user || user.role !== 'seller') {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Access Restricted</h2>
            <p className="text-gray-500">You must be logged in as a seller to view this page.</p>
            <button onClick={() => navigate('/seller/auth')} className="bg-leaf-600 text-white px-6 py-2 rounded-lg">Seller Login</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-gray-900 text-white flex-shrink-0 flex flex-col z-40 shadow-xl transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between gap-3">
           <div className="flex items-center gap-3">
             <div className="bg-leaf-500 p-2 rounded-xl text-white shadow-lg shadow-leaf-900/50"><Sprout size={24} fill="currentColor"/></div>
             <div>
               <h2 className="font-bold text-lg tracking-tight">Seller Hub</h2>
               <p className="text-xs text-gray-400">Partner Dashboard</p>
             </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={20}/></button>
        </div>
        
        <nav className="p-4 space-y-1.5 flex-grow">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Order Manager', icon: ShoppingCart, badge: mySalesData.pendingCount },
            { id: 'inventory', label: 'My Inventory', icon: Package },
            { id: 'add_product', label: 'Add Harvest', icon: Plus },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'settings', label: 'Farm Settings', icon: Settings },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-leaf-600 text-white shadow-lg shadow-leaf-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} /> {item.label}
              </div>
              {item.badge ? <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-gray-800/50 border border-gray-700">
             <img src={user.avatar} className="w-10 h-10 rounded-full bg-gray-700 object-cover" alt="" />
             <div className="flex-grow overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user.name}</p>
               <p className="text-[10px] text-gray-400 truncate">{user.farmName || 'Verified Farmer'}</p>
             </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 py-2.5 rounded-xl text-xs font-bold transition">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow lg:ml-0 p-4 md:p-8 overflow-y-auto w-full">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-700"><Menu size={20}/></button>
             <div className="flex items-center gap-2 font-bold text-gray-900"><Sprout className="text-leaf-600"/> Seller Hub</div>
           </div>
           <button onClick={logout} className="p-2 bg-gray-100 rounded-full"><LogOut size={18}/></button>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                        <p className="text-gray-500 text-sm">Welcome back, {user.name}!</p>
                    </div>
                    <button onClick={() => setActiveTab('add_product')} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-leaf-600 transition shadow-lg">
                        <Plus size={16}/> Add Harvest
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Sales', value: `₹${mySalesData.totalRevenue}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Pending Orders', value: mySalesData.pendingCount, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: 'Active Products', value: myProducts.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Today\'s Revenue', value: '₹2,450', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon size={24}/></div>
                                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900">Sales Analytics</h3>
                            <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 text-gray-600">
                                <option>Last 7 Days</option>
                                <option>Last Month</option>
                            </select>
                        </div>
                        <Chart />
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6">Top Products</h3>
                        <div className="space-y-4">
                            {myProducts.slice(0, 4).map((p, i) => (
                                <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{p.name.en}</p>
                                        <p className="text-xs text-gray-500">{p.stock || 100} units left</p>
                                    </div>
                                    <span className="text-sm font-bold text-leaf-600">₹{p.price}</span>
                                </div>
                            ))}
                            {myProducts.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No products listed yet.</p>}
                        </div>
                        <button onClick={() => setActiveTab('inventory')} className="w-full mt-6 py-2 text-xs font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1 group">
                            View Inventory <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {activeTab === 'add_product' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-500 hover:text-gray-900" onClick={() => setActiveTab('overview')}>
               <ChevronRight className="rotate-180" size={20} /> Back
             </div>
             <h1 className="text-2xl font-bold text-gray-900 mb-2">List New Produce</h1>
             <p className="text-gray-500 mb-8">Add details about your harvest to start selling.</p>

             <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Main Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Main Product Image</label>
                  <div className="flex justify-center">
                     <div className="relative group w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-leaf-400 transition overflow-hidden">
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <>
                            <ImageIcon size={40} className="text-gray-300 mb-2 group-hover:text-leaf-500" />
                            <p className="text-sm text-gray-500 font-medium">Click to upload main image</p>
                          </>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product Name (English)</label>
                     <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" placeholder="e.g. Red Onion" value={newProduct.nameEn} onChange={e => setNewProduct({...newProduct, nameEn: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                     <select className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        <option>Vegetable</option>
                        <option>Fruit</option>
                        <option>Root Veg</option>
                        <option>Leafy</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Name (Hindi)</label>
                     <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none font-hindi" placeholder="e.g. लाल प्याज" value={newProduct.nameHi} onChange={e => setNewProduct({...newProduct, nameHi: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Name (Bengali)</label>
                     <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none font-hindi" placeholder="e.g. लाल पेঁয়াজ" value={newProduct.nameBn} onChange={e => setNewProduct({...newProduct, nameBn: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (per {newProduct.baseUnit})</label>
                     <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                        <input required type="number" className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" placeholder="00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stock Available</label>
                     <input required type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" placeholder="100" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex justify-between">
                       Description
                       <button type="button" onClick={generateDescription} disabled={aiLoading} className="text-leaf-600 flex items-center gap-1 hover:underline disabled:opacity-50">
                           {aiLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} fill="currentColor"/>} Auto-Write
                       </button>
                   </label>
                   <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" rows={3} placeholder="Describe freshness, origin..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-leaf-200 transition">
                  List Product for Sale
                </button>
             </form>
          </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                        <p className="text-gray-500 text-sm">Manage your listed produce.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={inventorySearch}
                                onChange={e => setInventorySearch(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500"
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                        <button onClick={() => setActiveTab('add_product')} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-leaf-600 transition">
                            <Plus size={16}/> Add New
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {myProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                            <span className="font-bold text-gray-900">{p.name.en}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{p.price}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{p.stock || 100} units</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-900 p-1"><MoreVertical size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {myProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No products found. Start listing!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};