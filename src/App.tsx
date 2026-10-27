import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout & Global Components
import { PromoMarquee } from './components/PromoMarquee';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProductQuickView } from './components/ProductQuickView';
import { SizeGuideModal } from './components/SizeGuideModal';
import { SearchModal } from './components/SearchModal';

// Pages
import { Home } from './pages/Home';
import { MensCollection } from './pages/MensCollection';
import { KidsCollection } from './pages/KidsCollection';
import { ProductDetails } from './pages/ProductDetails';
import { Offers } from './pages/Offers';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { NotFound } from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

// Helper component to scroll window to top upon route change
const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const location = useLocation();

  // The admin dashboard is a separate lazy-loaded bundle with its own layout (no storefront header/footer).
  if (location.pathname.startsWith('/admin')) {
    return <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading admin…</div>}><AdminApp /></Suspense>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-vintage-cream text-vintage-charcoal">
      <ScrollToTopOnRoute />
      
      {/* 1. Continuous Promotional Marquee */}
      <PromoMarquee />

      {/* 2. Sticky Brand Navbar */}
      <Navbar />

      {/* 3. Main Dynamic Route Container with Framer Motion Page Transitions */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/mens" element={<MensCollection />} />
            <Route path="/kids" element={<KidsCollection />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* 4. Global Modals & Drawers */}
      <CartDrawer />
      <ProductQuickView />
      <SizeGuideModal />
      <SearchModal />

      {/* 5. Vintage Brand Footer */}
      <Footer />
    </div>
  );
};

export default App;
