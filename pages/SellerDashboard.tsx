
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, TrendingUp, DollarSign, Plus, Image as ImageIcon, 
  Settings, LogOut, ChevronRight, Search, Sprout, ShoppingCart, Truck, 
  CheckCircle, AlertCircle, Printer, Calendar, Banknote, User, MapPin,
  Upload, Trash2, MoreVertical, Filter, Save, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useProduct } from '../services/ProductContext';
import { useImage } from '../services/ImageContext';
import { useToast } from '../services/ToastContext';
import { useOrder } from '../services/OrderContext';

export const SellerDashboard: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { products, addProduct, updateProduct, bulkUpdateProducts } = useProduct();
  const { orders, updateOrderStatus } = useOrder();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'payments' | 'settings' | 'add_product'>('overview');
  
  // --- STATE: Add Product ---
  const [newProduct, setNewProduct] = useState({
    nameEn: '', nameHi: '', nameBn: '', price: '', category: 'Vegetable',
    baseUnit: 'kg', description: '', stock: 100,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
  
  // 1. Inventory Logic
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
  
  // 2. Sales & Orders
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imagePreview) {
        addToast('Please upload a main product image', 'error');
        return;
    }
    if (!user) return;

    const finalMainImage = imagePreview || 'https://via.placeholder.com/150';
    // Strict Single Image Policy
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
        sellerId: user.id,
        isLocal: true 
    });

    addToast('Product listed successfully!', 'success');
    setActiveTab('inventory');
    setNewProduct({ nameEn: '', nameHi: '', nameBn: '', price: '', category: 'Vegetable', baseUnit: 'kg', description: '', stock: 100 });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOrderAction = (orderId: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'Processing') nextStatus = 'Packed';
    else if (currentStatus === 'Packed') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';
    
    if (nextStatus) {
      updateOrderStatus(orderId, nextStatus as any);
      addToast(`Order updated to ${nextStatus}`, 'success');
    }
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
        farmName: farmSettings.farmName, 
        address: farmSettings.address,
        phone: farmSettings.phone,
        email: farmSettings.email
    });
    addToast("Farm settings saved successfully", "success");
  };

  // Inventory Table Handlers
  const toggleInventorySelection = (id: string) => {
    const newSet = new Set(selectedInventoryIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedInventoryIds(newSet);
  };

  const selectAllInventory = () => {
    if (selectedInventoryIds.size === myProducts.length) setSelectedInventoryIds(new Set());
    else setSelectedInventoryIds(new Set(myProducts.map(p => p.id)));
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleInlineUpdate = (id: string, field: 'price' | 'stock', value: string) => {
    const numValue = parseFloat(value);
    if (field === 'price' && !isNaN(numValue)) {
      updateProduct(id, { price: numValue });
    } else if (field === 'stock') {
      updateProduct(id, { inStock: numValue > 0 }); 
    }
  };

  const executeBulkAction = (action: 'price_increase' | 'in_stock' | 'out_of_stock') => {
    const ids = Array.from(selectedInventoryIds);
    if (ids.length === 0) return;

    if (action === 'in_stock') {
      bulkUpdateProducts(ids, { inStock: true });
      addToast(`${ids.length} items marked In Stock`, 'success');
    } else if (action === 'out_of_stock') {
      bulkUpdateProducts(ids, { inStock: false });
      addToast(`${ids.length} items marked Out of Stock`, 'success');
    } else if (action === 'price_increase') {
      addToast(`Bulk price update feature coming soon`, 'info');
    }
    setBulkActionOpen(false);
    setSelectedInventoryIds(new Set());
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const Chart = () => (
    <div className="relative h-64 w-full bg-white rounded-2xl p-4 flex items-end gap-2 overflow-hidden border border-gray-100">
        <div className="absolute top-4 left-4 text-xs font-bold text-gray-400">Revenue (Last 7 Days)</div>
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
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-900 text-white hidden lg:flex flex-col fixed h-full z-30 shadow-xl">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
           <div className="bg-leaf-500 p-2 rounded-xl text-white shadow-lg shadow-leaf-900/50"><Sprout size={24} fill="currentColor"/></div>
           <div>
             <h2 className="font-bold text-lg tracking-tight">Seller Hub</h2>
             <p className="text-xs text-gray-400">Partner Dashboard</p>
           </div>
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
              onClick={() => setActiveTab(item.id as any)} 
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
      <main className="flex-grow lg:ml-72 p-4 md:p-8 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 font-bold text-gray-900"><Sprout className="text-leaf-600"/> Seller Hub</div>
           <button onClick={logout} className="p-2 bg-gray-100 rounded-full"><LogOut size={18}/></button>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
             <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
               <div>
                 <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
                 <p className="text-gray-500 mt-1 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Store Statistics
                 </p>
               </div>
               <div className="flex gap-3">
                 <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2">
                   <Calendar size={16}/> Last 7 Days
                 </button>
                 <button onClick={() => setActiveTab('add_product')} className="bg-leaf-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-leaf-700 shadow-lg shadow-leaf-200 flex items-center gap-2">
                   <Plus size={18}/> New Listing
                 </button>
               </div>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'Total Revenue', value: formatCurrency(mySalesData.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                 { label: 'Pending Orders', value: mySalesData.pendingCount, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
                 { label: 'Active Listings', value: myProducts.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Customer Rating', value: '4.8/5', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="bg-gray-50 text-gray-400 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">This Week</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{stat.value}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">{stat.label}</p>
                 </div>
               ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Chart Section */}
               <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-900">Revenue Analytics</h3>
                   <button className="text-leaf-600 text-xs font-bold hover:underline">View Report</button>
                 </div>
                 <Chart />
               </div>

               {/* Top Products */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-6">Top Selling Items</h3>
                 <div className="space-y-4">
                   {myProducts.slice(0, 4).map((p, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                        <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs overflow-hidden">
                          <img src={p.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-sm text-gray-900">{p.name.en}</h4>
                          <p className="text-xs text-gray-500">{p.inStock ? 'In Stock' : 'Out of Stock'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-900">₹{p.price}</p>
                          <p className="text-[10px] text-green-600 font-bold">+12 sold</p>
                        </div>
                     </div>
                   ))}
                   {myProducts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No products yet.</p>}
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
               <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
               <div className="flex gap-2">
                 <input type="text" placeholder="Search Order ID..." className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-leaf-500" />
               </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mySalesData.sellerOrders.length > 0 ? mySalesData.sellerOrders.map((order, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{order.customer[0]}</div>
                              <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {order.items.map((item: any) => `${item.quantity}x ${item.name.en}`).join(', ')}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                              order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-yellow-50 text-yellow-700 border-yellow-100'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => addToast("Shipping Label Generated", "success")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900" title="Print Label">
                                <Printer size={16} />
                              </button>
                              {order.status !== 'Delivered' && (
                                <button 
                                  onClick={() => handleOrderAction(order.id, order.status)}
                                  className="bg-leaf-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-leaf-700 whitespace-nowrap"
                                >
                                  {order.status === 'Processing' ? 'Pack Order' : order.status === 'Packed' ? 'Ship Order' : 'Mark Delivered'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                            <Package size={32} className="opacity-20" />
                            <span>No orders found. Your harvest is waiting for buyers!</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
             {/* Header Actions */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                  {selectedInventoryIds.size > 0 && (
                    <div className="flex items-center gap-2 bg-leaf-50 px-3 py-1 rounded-lg text-xs font-bold text-leaf-700 animate-in slide-in-from-left-2">
                      <CheckCircle size={14} /> {selectedInventoryIds.size} Selected
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                   <div className="relative flex-grow md:flex-grow-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                      <input 
                        type="text" 
                        placeholder="Search product..." 
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-leaf-500 w-full md:w-64"
                      />
                   </div>
                   
                   {selectedInventoryIds.size > 0 ? (
                     <div className="relative">
                        <button 
                          onClick={() => setBulkActionOpen(!bulkActionOpen)}
                          className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition"
                        >
                          Bulk Actions <ChevronDown size={14} />
                        </button>
                        {bulkActionOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in zoom-in-95">
                             <button onClick={() => executeBulkAction('in_stock')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 border-b border-gray-50 text-green-600">Mark In Stock</button>
                             <button onClick={() => executeBulkAction('out_of_stock')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 border-b border-gray-50 text-orange-600">Mark Out of Stock</button>
                             <button onClick={() => executeBulkAction('price_increase')} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50">Increase Price 10%</button>
                          </div>
                        )}
                     </div>
                   ) : (
                     <button onClick={() => setActiveTab('add_product')} className="bg-leaf-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-leaf-700 transition">
                       <Plus size={16} /> Add Product
                     </button>
                   )}
                </div>
             </div>

             {/* Inventory Table */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                     <tr>
                       <th className="px-4 py-4 w-10">
                         <input type="checkbox" checked={selectedInventoryIds.size === myProducts.length && myProducts.length > 0} onChange={selectAllInventory} className="rounded border-gray-300 text-leaf-600 focus:ring-leaf-500 cursor-pointer" />
                       </th>
                       <th className="px-4 py-4">Product</th>
                       <th className="px-4 py-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('category')}>Category {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                       <th className="px-4 py-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('price')}>Price {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} className="inline"/> : <ChevronDown size={12} className="inline"/>)}</th>
                       <th className="px-4 py-4">Stock Status</th>
                       <th className="px-4 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {myProducts.map(p => (
                       <tr key={p.id} className="hover:bg-gray-50/50 transition group">
                         <td className="px-4 py-4">
                           <input 
                            type="checkbox" 
                            checked={selectedInventoryIds.has(p.id)} 
                            onChange={() => toggleInventorySelection(p.id)}
                            className="rounded border-gray-300 text-leaf-600 focus:ring-leaf-500 cursor-pointer" 
                           />
                         </td>
                         <td className="px-4 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                               <img src={p.image} alt="" className="w-full h-full object-cover" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-gray-900">{p.name.en}</p>
                               <p className="text-[10px] text-gray-500">Unit: {p.baseUnit}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-4 py-4 text-sm text-gray-600">{p.category}</td>
                         <td className="px-4 py-4">
                           <div className="flex items-center gap-1">
                             <span className="text-gray-400 font-bold">₹</span>
                             <input 
                                type="number" 
                                defaultValue={p.price} 
                                onBlur={(e) => handleInlineUpdate(p.id, 'price', e.target.value)}
                                className="w-20 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-leaf-500 focus:outline-none text-sm font-bold text-gray-900 py-1 transition-colors"
                             />
                           </div>
                         </td>
                         <td className="px-4 py-4">
                           <select 
                              value={p.inStock ? '1' : '0'} 
                              onChange={(e) => handleInlineUpdate(p.id, 'stock', e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-md border-none focus:ring-0 cursor-pointer ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                           >
                             <option value="1">In Stock</option>
                             <option value="0">Out of Stock</option>
                           </select>
                         </td>
                         <td className="px-4 py-4 text-right">
                           <button className="text-gray-400 hover:text-leaf-600 p-2 rounded-lg hover:bg-gray-100 transition"><Settings size={16}/></button>
                         </td>
                       </tr>
                     ))}
                     {myProducts.length === 0 && (
                       <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}

        {/* --- PAYMENTS TAB --- */}
        {activeTab === 'payments' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
             <h1 className="text-2xl font-bold text-gray-900">Payments & Finance</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl">
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Available for Withdrawal</p>
                   <h2 className="text-4xl font-extrabold">₹{formatCurrency(mySalesData.totalRevenue * 0.9)}</h2>
                   <button className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold text-sm transition border border-white/10">Withdraw Funds</button>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Clearance</p>
                   <h2 className="text-3xl font-extrabold text-gray-900">₹{formatCurrency(mySalesData.totalRevenue * 0.1)}</h2>
                   <p className="text-xs text-gray-400 mt-2">Available after delivery confirmation</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Next Payout</p>
                   <div className="flex items-center gap-3 mt-1">
                      <Calendar className="text-leaf-600" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900">Every Friday</h3>
                        <p className="text-xs text-gray-400">Automatic transfer</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Banknote size={20} className="text-gray-400"/> Bank Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Account Holder Name</label>
                      <input type="text" value={user.name} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"/>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bank Account Number</label>
                      <input type="text" value={farmSettings.accountNumber} onChange={(e) => setFarmSettings({...farmSettings, accountNumber: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 font-mono"/>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">IFSC Code</label>
                      <input type="text" value={farmSettings.ifsc} onChange={(e) => setFarmSettings({...farmSettings, ifsc: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500 font-mono uppercase"/>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">UPI ID (Optional)</label>
                      <input type="text" value={farmSettings.upiId} onChange={(e) => setFarmSettings({...farmSettings, upiId: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-leaf-500"/>
                   </div>
                </div>
                <div className="mt-6 flex justify-end">
                   <button onClick={() => addToast("Bank details updated", "success")} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">Save Details</button>
                </div>
             </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
             <h1 className="text-2xl font-bold text-gray-900 mb-6">Farm Settings</h1>
             <form onSubmit={handleSettingsSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                   <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <ImageIcon size={24}/>}
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900">Farm Logo / Profile Pic</h4>
                      <p className="text-xs text-gray-500 mt-1">Upload a clear image of your farm or logo.</p>
                      <button type="button" className="text-leaf-600 text-xs font-bold mt-2 hover:underline">Upload New</button>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Farm Name</label>
                   <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none" value={farmSettings.farmName} onChange={e => setFarmSettings({...farmSettings, farmName: e.target.value})} />
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Farm Location / Pickup Address</label>
                   <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none" rows={3} value={farmSettings.address} onChange={e => setFarmSettings({...farmSettings, address: e.target.value})}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Number</label>
                      <input type="tel" value={farmSettings.phone} onChange={e => setFarmSettings({...farmSettings, phone: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                      <input type="email" value={farmSettings.email} onChange={e => setFarmSettings({...farmSettings, email: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-leaf-500 focus:outline-none" />
                   </div>
                </div>

                <div className="pt-4">
                   <button type="submit" className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-leaf-200 transition flex items-center justify-center gap-2">
                     <Save size={18} /> Save Changes
                   </button>
                </div>
             </form>
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

                {/* Removed Gallery Upload Section to enforce Single Image Policy */}

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
                     <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none font-hindi" placeholder="e.g. লাল পেঁয়াজ" value={newProduct.nameBn} onChange={e => setNewProduct({...newProduct, nameBn: e.target.value})} />
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
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                   <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-leaf-500 focus:outline-none" rows={3} placeholder="Describe freshness, origin..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-leaf-600 hover:bg-leaf-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-leaf-200 transition">
                  List Product for Sale
                </button>
             </form>
          </div>
        )}

      </main>
    </div>
  );
};
