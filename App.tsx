import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './services/CartContext';
import { AuthProvider } from './services/AuthContext';
import { OrderProvider } from './services/OrderContext';
import { ImageProvider } from './services/ImageContext';
import { ProductProvider } from './services/ProductContext';
import { ToastProvider } from './services/ToastContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Dashboard } from './pages/Dashboard';
import { About, Contact, Blog, PrivacyPolicy, TermsConditions, RefundPolicy, ShippingPolicy, CancellationPolicy, Disclaimer } from './pages/StaticPages';
import { Account } from './pages/Account';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Settings } from './pages/Settings';
import { Wishlist } from './pages/Wishlist';
import { Login, Signup } from './pages/Auth';
import { Subscription } from './pages/Subscription';
import { NotFound } from './pages/NotFound';
import { SellerLanding } from './pages/SellerLanding';
import { SellerAuth } from './pages/SellerAuth';
import { SellerDashboard } from './pages/SellerDashboard';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <OrderProvider>
            <ImageProvider>
              <CartProvider>
                <HashRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Shop />} />
                      <Route path="home" element={<Home />} />
                      <Route path="shop" element={<Shop />} />
                      <Route path="product/:id" element={<ProductDetails />} />
                      <Route path="cart" element={<Cart />} />
                      
                      {/* Auth Routes */}
                      <Route path="login" element={<Login />} />
                      <Route path="signup" element={<Signup />} />
                      
                      {/* Seller Routes */}
                      <Route path="seller" element={<SellerLanding />} />
                      <Route path="seller/auth" element={<SellerAuth />} />
                      
                      {/* User Routes */}
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="order-confirmation" element={<OrderConfirmation />} />
                      <Route path="account" element={<Account />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="track-order/:id" element={<OrderTracking />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="subscription" element={<Subscription />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      
                      {/* Static */}
                      <Route path="about" element={<About />} />
                      <Route path="contact" element={<Contact />} />
                      <Route path="blog" element={<Blog />} />
                      
                      {/* Legal */}
                      <Route path="privacy" element={<PrivacyPolicy />} />
                      <Route path="terms" element={<TermsConditions />} />
                      <Route path="refund-policy" element={<RefundPolicy />} />
                      <Route path="shipping-policy" element={<ShippingPolicy />} />
                      <Route path="cancellation-policy" element={<CancellationPolicy />} />
                      <Route path="disclaimer" element={<Disclaimer />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    
                    {/* Dashboards outside main layout if needed */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  </Routes>
                </HashRouter>
              </CartProvider>
            </ImageProvider>
          </OrderProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;