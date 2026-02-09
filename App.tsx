
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './services/CartContext';
import { AuthProvider } from './services/AuthContext';
import { OrderProvider } from './services/OrderContext';
import { ImageProvider } from './services/ImageContext';
import { ProductProvider } from './services/ProductContext';
import { FarmerProvider } from './services/FarmerContext';
import { ToastProvider } from './services/ToastContext';
import { PincodeProvider } from './services/PincodeContext';
import { CookieConsent } from './components/CookieConsent';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Dashboard } from './pages/Dashboard';
import { Catalogue } from './pages/Catalogue';
import { About, Contact, Blog, PrivacyPolicy, TermsConditions, RefundPolicy, ShippingPolicy, CancellationPolicy, Disclaimer } from './pages/StaticPages';
import { Account } from './pages/Account';
import { Orders } from './pages/Orders';
import { OrderTracking } from './pages/OrderTracking';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import { Wishlist } from './pages/Wishlist';
import { Login, Signup } from './pages/Auth';
import { NotFound } from './pages/NotFound';
import { SellerLanding } from './pages/SellerLanding';
import { SellerAuth } from './pages/SellerAuth';
import { SellerDashboard } from './pages/SellerDashboard';
import { FarmerProfile } from './pages/FarmerProfile';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <FarmerProvider>
            <OrderProvider>
              <ImageProvider>
                <CartProvider>
                  <PincodeProvider>
                    <HashRouter>
                      <Routes>
                        <Route path="/" element={<Layout />}>
                          <Route index element={<Shop />} />
                          <Route path="home" element={<Home />} />
                          <Route path="shop" element={<Shop />} />
                          <Route path="catalogue" element={<Catalogue />} />
                          <Route path="product/:id" element={<ProductDetails />} />
                          <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
                          <Route path="login" element={<Login />} />
                          <Route path="signup" element={<Signup />} />
                          <Route path="seller" element={<SellerLanding />} />
                          <Route path="seller/auth" element={<SellerAuth />} />
                          <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                          <Route path="order-confirmation" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
                          <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
                          <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
                          <Route path="track-order/:id" element={<RequireAuth><OrderTracking /></RequireAuth>} />
                          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
                          <Route path="subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
                          <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                          <Route path="about" element={<About />} />
                          <Route path="contact" element={<Contact />} />
                          <Route path="blog" element={<Blog />} />
                          <Route path="privacy" element={<PrivacyPolicy />} />
                          <Route path="terms" element={<TermsConditions />} />
                          <Route path="refund-policy" element={<RefundPolicy />} />
                          <Route path="shipping-policy" element={<ShippingPolicy />} />
                          <Route path="cancellation-policy" element={<CancellationPolicy />} />
                          <Route path="disclaimer" element={<Disclaimer />} />
                          <Route path="farmer/:id" element={<FarmerProfile />} />
                          <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route path="/dashboard" element={<RequireRole role="seller"><Dashboard /></RequireRole>} />
                        <Route path="/seller/dashboard" element={<RequireRole role="seller"><SellerDashboard /></RequireRole>} />
                      </Routes>
                      <CookieConsent />
                    </HashRouter>
                  </PincodeProvider>
                </CartProvider>
              </ImageProvider>
            </OrderProvider>
          </FarmerProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
