/**
 * FRESHLEAF - MAIN JAVASCRIPT
 * Includes: Protected Storage, Router, State Management, UI Rendering
 */

// ==========================================
// 1. DATA (CONSTANTS)
// ==========================================
const PRODUCTS = [
  // Fruits
  { id: 'f-1', name: { en: 'Apple Washington', hi: 'वाशिंगटन सेब', bn: 'ওয়াশিংটন আপেল' }, price: 135, category: 'Imported Fruit', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80', description: 'Crisp and sweet Washington apples.', baseUnit: 'kg', oldPrice: 160, inStock: true, gallery: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1601275868399-45bec4f4cd9d?auto=format&fit=crop&w=800&q=80'] },
  { id: 'f-2', name: { en: 'Apple Shimla', hi: 'शिमला सेब', bn: 'শিমলা আপেল' }, price: 115, category: 'Apple', image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80', description: 'Fresh apples from Shimla orchards.', baseUnit: 'kg', inStock: true, isLocal: true, gallery: ['https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80'] },
  { id: 'f-5', name: { en: 'Avocado', hi: 'एवोकाडो', bn: 'অ্যাভোকাডো' }, price: 205, category: 'Exotic', image: 'https://images.unsplash.com/photo-1523049673856-6485b5801825?auto=format&fit=crop&w=800&q=80', description: 'Creamy butter fruit.', baseUnit: 'pc', inStock: true, isNew: true, gallery: ['https://images.unsplash.com/photo-1523049673856-6485b5801825?auto=format&fit=crop&w=800&q=80'] },
  { id: 'f-6', name: { en: 'Banana Morris', hi: 'मॉरिस केला', bn: 'মরিস কলা' }, price: 31, category: 'Banana', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80', description: 'Sweet Morris bananas.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80'] },
  { id: 'f-17', name: { en: 'Mango', hi: 'आम', bn: 'আম' }, price: 102, category: 'Mango', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80', description: 'King of fruits.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80'] },
  { id: 'f-22', name: { en: 'Pomegranate Kabul', hi: 'काबुली अनार', bn: 'কাবুলি বেদানা' }, price: 125, category: 'Exotic', image: 'https://images.unsplash.com/photo-1541345263-12d9927806f1?auto=format&fit=crop&w=800&q=80', description: 'Deep red pomegranate.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1541345263-12d9927806f1?auto=format&fit=crop&w=800&q=80'] },
  
  // Vegetables
  { id: 'v-1', name: { en: 'Onion Big', hi: 'बड़ा प्याज', bn: 'বড় পেঁয়াজ' }, price: 34, category: 'Bulb', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80', description: 'Large red onions.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80'] },
  { id: 'v-3', name: { en: 'Tomato', hi: 'टमाटर', bn: 'টমেটো' }, price: 51, category: 'Fruit Veg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', description: 'Ripe red tomatoes.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'] },
  { id: 'v-6', name: { en: 'Potato', hi: 'आलू', bn: 'আলু' }, price: 41, category: 'Root Veg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80', description: 'Standard potatoes.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'] },
  { id: 'v-13', name: { en: 'Capsicum', hi: 'शिमला मिर्च', bn: 'क্যাপসিকাম' }, price: 45, category: 'Fruit Veg', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80', description: 'Green bell pepper.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80'] },
  { id: 'v-19', name: { en: 'Carrot', hi: 'गाजर', bn: 'গাজর' }, price: 43, category: 'Root Veg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80', description: 'Orange carrots.', baseUnit: 'kg', inStock: true, gallery: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80'] },
  { id: 'v-20', name: { en: 'Cauliflower', hi: 'फूलगोभी', bn: 'ফুলকপি' }, price: 31, category: 'Flower Veg', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80', description: 'Fresh cauliflower.', baseUnit: 'pc', inStock: true, gallery: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80'] }
];

// ==========================================
// 2. PROTECTED STORAGE (Security Logic)
// ==========================================
// Uses Base64 Encoding/Decoding to obscure data in LocalStorage
const SecureStore = {
    _encode: (data) => btoa(encodeURIComponent(JSON.stringify(data))),
    _decode: (str) => JSON.parse(decodeURIComponent(atob(str))),

    setItem: (key, value) => {
        try {
            const secureData = SecureStore._encode(value);
            localStorage.setItem(`fl_${key}`, secureData);
        } catch (e) { console.error("Storage Error", e); }
    },

    getItem: (key) => {
        try {
            const data = localStorage.getItem(`fl_${key}`);
            if (!data) return null;
            return SecureStore._decode(data);
        } catch (e) {
            console.error("Retrieval Error", e);
            return null;
        }
    },

    removeItem: (key) => localStorage.removeItem(`fl_${key}`)
};

// ==========================================
// 3. STATE MANAGEMENT
// ==========================================
const AppState = {
    cart: SecureStore.getItem('cart') || [],
    user: SecureStore.getItem('user') || null,
    
    addToCart: (product, qty, unit, price) => {
        const existing = AppState.cart.find(item => item.id === product.id && item.unit === unit);
        if (existing) {
            existing.qty += qty;
        } else {
            AppState.cart.push({ ...product, qty, unit, price });
        }
        SecureStore.setItem('cart', AppState.cart);
        UI.updateCartCount();
        UI.showToast(`Added ${product.name.en} to cart!`);
    },

    removeFromCart: (productId, unit) => {
        AppState.cart = AppState.cart.filter(item => !(item.id === productId && item.unit === unit));
        SecureStore.setItem('cart', AppState.cart);
        router.navigate('cart'); // Re-render
        UI.updateCartCount();
    },

    updateCartQty: (productId, unit, delta) => {
        const item = AppState.cart.find(i => i.id === productId && i.unit === unit);
        if(item) {
            item.qty += delta;
            if(item.qty < 1) item.qty = 1;
            SecureStore.setItem('cart', AppState.cart);
            router.navigate('cart');
            UI.updateCartCount();
        }
    },

    login: (email) => {
        const user = { name: 'Demo User', email, id: 'u_123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' };
        AppState.user = user;
        SecureStore.setItem('user', user);
        router.navigate('home');
        UI.renderAuth();
    },

    logout: () => {
        AppState.user = null;
        SecureStore.removeItem('user');
        router.navigate('home');
        UI.renderAuth();
    }
};

// ==========================================
// 4. ROUTER
// ==========================================
const router = {
    routes: {
        'home': () => UI.renderHome(),
        'shop': () => UI.renderShop(),
        'cart': () => UI.renderCart(),
        'about': () => UI.renderAbout(),
        'product': (id) => UI.renderProductDetails(id)
    },
    
    navigate: (route, param = null) => {
        window.location.hash = param ? `#${route}?id=${param}` : `#${route}`;
        window.scrollTo(0,0);
        
        // Router Logic
        const container = document.getElementById('app');
        container.innerHTML = '<div class="flex justify-center p-20"><div class="animate-spin text-leaf-600"><i data-lucide="loader-2" size="40"></i></div></div>';
        lucide.createIcons();

        setTimeout(() => {
            if (route === 'product' && param) {
                router.routes['product'](param);
            } else if (router.routes[route]) {
                router.routes[route]();
            } else {
                router.routes['home'](); // Default
            }
            lucide.createIcons();
            
            // Update active state in nav
            document.querySelectorAll('.nav-link').forEach(el => {
                if(el.getAttribute('href') === `#${route}`) el.classList.add('text-leaf-600', 'bg-white/50');
                else el.classList.remove('text-leaf-600', 'bg-white/50');
            });
        }, 100); // Tiny fake delay for smooth feel
    },

    init: () => {
        const hash = window.location.hash.replace('#', '');
        const [route, paramStr] = hash.split('?');
        const param = paramStr ? paramStr.split('=')[1] : null;
        router.navigate(route || 'home', param);
    }
};

// ==========================================
// 5. UI RENDERERS
// ==========================================
const UI = {
    formatPrice: (price) => `₹${price}`,

    updateCartCount: () => {
        const count = AppState.cart.reduce((acc, item) => acc + item.qty, 0);
        const badge = document.getElementById('cart-count');
        badge.textContent = count;
        if(count > 0) badge.classList.remove('hidden');
        else badge.classList.add('hidden');
    },

    renderAuth: () => {
        const container = document.getElementById('top-bar-auth');
        if(AppState.user) {
            container.innerHTML = `
                <span class="text-white/90">Hi, ${AppState.user.name.split(' ')[0]}</span>
                <button onclick="AppState.logout()" class="text-white hover:text-red-200 ml-2">Logout</button>
            `;
        } else {
            container.innerHTML = `<button onclick="UI.showLoginModal()" class="hover:text-yellow-300 transition-colors text-white/90 flex items-center gap-1">Login</button>`;
        }
    },

    showToast: (msg) => {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in text-sm font-bold flex items-center gap-2';
        toast.innerHTML = `<i data-lucide="check-circle" size="16"></i> ${msg}`;
        document.body.appendChild(toast);
        lucide.createIcons();
        setTimeout(() => toast.remove(), 3000);
    },

    showLoginModal: () => {
        const email = prompt("Enter email to login (Demo):", "user@example.com");
        if(email) AppState.login(email);
    },

    // --- PAGE: HOME ---
    renderHome: () => {
        const app = document.getElementById('app');
        const featured = PRODUCTS.slice(0, 4);
        
        app.innerHTML = `
            <!-- Hero -->
            <section class="relative min-h-[85vh] flex items-center bg-[#f0fdf4] overflow-hidden">
                <div class="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div class="space-y-8 animate-fade-in">
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-leaf-200 shadow-sm">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-xs font-bold text-gray-600 tracking-wide uppercase">100% Organic</span>
                        </div>
                        <h1 class="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1]">
                            Fresh Vegetables <br />
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-leaf-600 to-leaf-400">Delivered Daily</span>
                        </h1>
                        <p class="text-gray-600 text-lg md:text-xl max-w-lg leading-relaxed">
                            Order fresh fruits and vegetables sourced directly from Indian farmers.
                        </p>
                        <button onclick="router.navigate('shop')" class="bg-leaf-600 hover:bg-leaf-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-leaf-500/30">
                            Shop Now <i data-lucide="arrow-right"></i>
                        </button>
                    </div>
                    <div class="relative">
                        <img src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80" class="rounded-[2.5rem] shadow-2xl w-full object-cover transform md:rotate-3 hover:rotate-0 transition duration-700">
                    </div>
                </div>
            </section>

            <!-- Features -->
            <section class="py-20 bg-white">
                <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    ${[
                        {icon: 'truck', title: 'Free Shipping', desc: 'Orders above ₹499'},
                        {icon: 'shield-check', title: 'Secure', desc: '100% Secure Payment'},
                        {icon: 'clock', title: '24/7 Support', desc: 'Dedicated Support'},
                        {icon: 'map-pin', title: 'Track Order', desc: 'Live Tracking'}
                    ].map(f => `
                        <div class="p-8 border border-gray-100 rounded-3xl hover:shadow-card-hover transition">
                            <div class="text-leaf-600 mb-4"><i data-lucide="${f.icon}" size="32"></i></div>
                            <h3 class="text-xl font-bold text-gray-900">${f.title}</h3>
                            <p class="text-gray-500">${f.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Featured Products -->
            <section class="py-20 bg-gray-50">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-gray-900 mb-8">Best Selling Products</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${featured.map(p => UI.components.productCard(p)).join('')}
                    </div>
                </div>
            </section>
        `;
    },

    // --- PAGE: SHOP ---
    renderShop: () => {
        const app = document.getElementById('app');
        
        // Group by Categories
        const daily = PRODUCTS.filter(p => ['Potato', 'Onion', 'Tomato', 'Banana'].some(k => p.name.en.includes(k)));
        const exotic = PRODUCTS.filter(p => p.category === 'Exotic' || p.category === 'Imported Fruit');
        const fruits = PRODUCTS.filter(p => p.category === 'Mango' || p.category === 'Banana' || p.category === 'Apple');

        app.innerHTML = `
            <div class="bg-gray-900 py-16 text-center text-white mb-10">
                <h1 class="text-4xl font-bold mb-2">Our Fresh Collection</h1>
                <p class="text-gray-400">Handpicked goodness for your kitchen</p>
            </div>
            
            <div class="container mx-auto px-4 space-y-16 pb-20">
                ${UI.components.productSection("Daily Essentials", daily)}
                ${UI.components.productSection("Exotic & Imported", exotic)}
                ${UI.components.productSection("Seasonal Fruits", fruits)}
            </div>
        `;
    },

    // --- PAGE: PRODUCT DETAILS ---
    renderProductDetails: (id) => {
        const product = PRODUCTS.find(p => p.id === id);
        if(!product) return router.navigate('shop');
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="py-12 bg-gray-50 min-h-screen">
                <div class="container mx-auto px-4 max-w-6xl">
                    <button onclick="router.navigate('shop')" class="flex items-center gap-2 text-gray-500 hover:text-leaf-600 mb-8 font-bold">
                        <i data-lucide="arrow-left"></i> Back to Shop
                    </button>
                    
                    <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                        <div class="md:w-1/2 p-10 bg-gray-50/50">
                            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden aspect-square mb-4 img-zoom-container">
                                <img src="${product.image}" alt="${product.name.en}" class="w-full h-full object-cover">
                            </div>
                        </div>
                        
                        <div class="md:w-1/2 p-12">
                            <span class="text-xs font-bold bg-leaf-100 text-leaf-700 px-2 py-1 rounded uppercase">${product.category}</span>
                            <h1 class="text-4xl font-extrabold text-gray-900 mt-2 mb-2">${product.name.en}</h1>
                            <p class="text-xl text-gray-500 mb-6 font-hindi">${product.name.hi} | ${product.name.bn}</p>
                            
                            <div class="flex items-end gap-4 mb-8 pb-8 border-b border-gray-100">
                                <div class="text-5xl font-extrabold text-gray-900">₹${product.price}<span class="text-lg text-gray-400 ml-1">/${product.baseUnit}</span></div>
                            </div>
                            
                            <p class="text-gray-600 leading-relaxed mb-8">${product.description} Sourced directly from verified organic farms.</p>
                            
                            <div class="flex gap-4">
                                <button onclick="AppState.addToCart(PRODUCTS.find(p => p.id === '${product.id}'), 1, '1${product.baseUnit}', ${product.price})" class="flex-grow bg-leaf-600 hover:bg-leaf-700 text-white h-14 rounded-xl font-bold text-lg shadow-lg">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- PAGE: CART ---
    renderCart: () => {
        const app = document.getElementById('app');
        const cart = AppState.cart;
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        if (cart.length === 0) {
            app.innerHTML = `
                <div class="min-h-[70vh] flex flex-col items-center justify-center p-4">
                    <div class="bg-gray-100 p-8 rounded-full mb-6 text-gray-400"><i data-lucide="shopping-bag" size="64"></i></div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
                    <button onclick="router.navigate('shop')" class="bg-leaf-600 text-white px-6 py-2 rounded-lg font-bold">Start Shopping</button>
                </div>`;
            return;
        }

        app.innerHTML = `
            <div class="py-12 bg-gray-50 min-h-screen">
                <div class="container mx-auto px-4 max-w-5xl">
                    <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
                    <div class="flex flex-col lg:flex-row gap-8">
                        <div class="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            ${cart.map(item => `
                                <div class="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0">
                                    <img src="${item.image}" class="w-20 h-20 rounded-xl object-cover bg-gray-100">
                                    <div class="flex-grow">
                                        <h3 class="font-bold text-gray-900">${item.name.en}</h3>
                                        <p class="text-xs text-gray-500">${item.unit}</p>
                                        <div class="font-bold text-leaf-700 mt-1">₹${item.price * item.qty}</div>
                                    </div>
                                    <div class="flex items-center bg-gray-50 rounded-lg">
                                        <button onclick="AppState.updateCartQty('${item.id}', '${item.unit}', -1)" class="p-2 text-gray-600"><i data-lucide="minus" size="14"></i></button>
                                        <span class="px-2 font-bold text-sm">${item.qty}</span>
                                        <button onclick="AppState.updateCartQty('${item.id}', '${item.unit}', 1)" class="p-2 text-gray-600"><i data-lucide="plus" size="14"></i></button>
                                    </div>
                                    <button onclick="AppState.removeFromCart('${item.id}', '${item.unit}')" class="text-red-400 p-2"><i data-lucide="trash-2" size="18"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="lg:w-1/3">
                            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                                <h2 class="text-lg font-bold mb-4">Summary</h2>
                                <div class="flex justify-between mb-2 text-gray-600"><span>Subtotal</span><span>₹${total}</span></div>
                                <div class="flex justify-between mb-4 text-gray-600"><span>Shipping</span><span class="text-green-600">Free</span></div>
                                <div class="border-t pt-4 flex justify-between font-bold text-xl text-gray-900 mb-6"><span>Total</span><span>₹${total}</span></div>
                                <button onclick="alert('Proceeding to Checkout... (This is a demo)')" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-leaf-600 transition">Checkout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAbout: () => {
        const app = document.getElementById('app');
        app.innerHTML = `<div class="p-20 text-center font-bold text-2xl">About Page Content</div>`;
    },

    // --- REUSABLE COMPONENTS ---
    components: {
        productSection: (title, products) => {
            if(!products.length) return '';
            return `
                <section>
                    <div class="flex items-center gap-2 mb-6">
                        <div class="p-2 bg-leaf-50 rounded-lg text-leaf-600"><i data-lucide="leaf"></i></div>
                        <h2 class="text-2xl font-bold text-gray-900">${title}</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${products.map(p => UI.components.productCard(p)).join('')}
                    </div>
                </section>
            `;
        },

        productCard: (product) => {
            return `
                <div class="bg-white rounded-3xl shadow-soft hover:shadow-card-hover transition-all duration-300 group overflow-hidden border border-gray-100 flex flex-col h-full relative">
                    <!-- Image -->
                    <div class="relative block aspect-[4/3] overflow-hidden bg-gray-100">
                        <img src="${product.image}" onclick="router.navigate('product', '${product.id}')" class="cursor-pointer w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="${product.name.en}">
                        ${product.inStock ? '<span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Stock</span>' : ''}
                    </div>
                    
                    <!-- Content -->
                    <div class="p-5 flex-grow flex flex-col">
                        <div class="mb-1 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded uppercase tracking-wide">${product.category}</span>
                            <div class="flex items-center gap-1 text-yellow-400"><i data-lucide="star" size="12" fill="currentColor"></i><span class="text-xs font-bold text-gray-500">4.5</span></div>
                        </div>
                        <h3 onclick="router.navigate('product', '${product.id}')" class="cursor-pointer font-bold text-gray-800 text-lg leading-tight group-hover:text-leaf-700 transition-colors line-clamp-1">${product.name.en}</h3>
                        <p class="text-xs text-gray-400 font-medium truncate font-hindi mt-1">${product.name.hi}</p>
                        
                        <div class="mt-auto pt-4 border-t border-gray-50 mt-4">
                            <div class="flex items-end justify-between mb-4">
                                <div><span class="text-[10px] text-gray-400 font-medium block">Price</span><span class="font-extrabold text-xl text-gray-900">₹${product.price}</span></div>
                                <div class="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded">1 ${product.baseUnit}</div>
                            </div>
                            <button onclick="AppState.addToCart(PRODUCTS.find(p => p.id === '${product.id}'), 1, '1${product.baseUnit}', ${product.price})" class="w-full bg-gray-900 hover:bg-leaf-600 text-white h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-leaf-500/30">
                                <i data-lucide="plus" size="14"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

// ==========================================
// 6. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Init Router & UI
    router.init();
    UI.updateCartCount();
    UI.renderAuth();
    lucide.createIcons();

    // Mobile Menu Toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        alert("Mobile menu would slide in here.");
    });
});

// Chatbot Toggles (Global Scope)
window.toggleChat = () => {
    const modal = document.getElementById('chat-modal');
    modal.classList.toggle('hidden');
};

window.handleChatSubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    
    if(!input.value.trim()) return;
    
    // User Msg
    container.innerHTML += `<div class="flex justify-end"><div class="bg-leaf-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">${input.value}</div></div>`;
    
    // Auto Response
    setTimeout(() => {
        container.innerHTML += `<div class="flex justify-start"><div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 shadow-sm">That's a great question about ${input.value}. Our support team will call you shortly!</div></div>`;
        container.scrollTop = container.scrollHeight;
    }, 800);
    
    input.value = '';
    container.scrollTop = container.scrollHeight;
};

// Expose Router/State for inline HTML clicks
window.router = router;
window.AppState = AppState;
window.PRODUCTS = PRODUCTS;
window.UI = UI;