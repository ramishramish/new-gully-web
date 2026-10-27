import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../data/storeConfig';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { cartCount, wishlist, setIsCartDrawerOpen, setIsSearchOpen } = useCart();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle sticky navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: "Men's Collection", path: '/mens' },
    { label: "Kids' Collection", path: '/kids' },
    { label: 'Offers', path: '/offers', badge: 'Sale' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-vintage-cream/95 backdrop-blur-md shadow-vintage-sm border-b border-vintage-border'
            : 'bg-vintage-cream border-b border-vintage-border/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-vintage-brown hover:text-vintage-burgundy focus:outline-none focus:ring-2 focus:ring-vintage-gold"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 ml-1 text-vintage-brown hover:text-vintage-burgundy"
                aria-label="Search clothing"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-initial flex items-center justify-center lg:justify-start">
              <Link to="/" className="group flex items-center space-x-3 py-1">
                {!logoError ? (
                  <img
                    src="/images/new-gully-logo.png"
                    alt="NEW GULLY Logo"
                    onError={() => setLogoError(true)}
                    className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="font-display font-bold text-2xl tracking-widest text-vintage-brown group-hover:text-vintage-burgundy transition-colors">
                      NEW GULLY
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-vintage-gold-dark font-medium -mt-1">
                      EST. 2016 • PALIKKAL BAZAR
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative py-1 text-sm font-semibold tracking-wider uppercase transition-colors duration-200 group ${
                      isActive
                        ? 'text-vintage-burgundy'
                        : 'text-vintage-brown hover:text-vintage-burgundy'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        {link.label}
                        {link.badge && (
                          <span className="bg-vintage-burgundy text-vintage-cream text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            {link.badge}
                          </span>
                        )}
                      </span>
                      {/* Active indicator underline */}
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] bg-vintage-gold transition-all duration-300 ${
                          isActive ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Utility Actions: Search, Wishlist, Cart */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-vintage-muted hover:text-vintage-brown border border-vintage-border rounded hover:border-vintage-gold transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-4 h-4 text-vintage-gold-dark" />
                <span>Search catalog...</span>
                <kbd className="bg-vintage-ivory px-1.5 py-0.5 text-[10px] text-vintage-muted rounded border border-vintage-border">
                  ⌘K
                </kbd>
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative p-2 text-vintage-brown hover:text-vintage-burgundy transition-colors"
                aria-label={`Wishlist (${wishlist.length} saved)`}
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-vintage-burgundy text-vintage-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 text-vintage-brown hover:text-vintage-burgundy transition-colors"
                aria-label={`Shopping bag with ${cartCount} items`}
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-vintage-gold text-vintage-brown-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-vintage-charcoal/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-vintage-cream shadow-2xl flex flex-col z-10 border-r border-vintage-border">
            <div className="flex items-center justify-between px-6 py-5 border-b border-vintage-border bg-vintage-ivory/50">
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg tracking-widest text-vintage-brown">
                  NEW GULLY
                </span>
                <span className="text-[10px] text-vintage-gold-dark font-semibold">EST. 2016</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-vintage-muted hover:text-vintage-brown"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 px-3 text-base font-semibold tracking-wider uppercase transition-colors rounded ${
                        isActive
                          ? 'bg-vintage-ivory text-vintage-burgundy border-l-4 border-vintage-burgundy font-bold'
                          : 'text-vintage-brown hover:bg-vintage-ivory/60'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </NavLink>
                ))}
              </div>

              <div className="pt-6 border-t border-vintage-border space-y-3">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-vintage-muted hover:text-vintage-brown"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" /> My Wishlist
                  </span>
                  <span className="bg-vintage-sand px-2 py-0.5 text-xs rounded-full">
                    {wishlist.length}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-vintage-muted hover:text-vintage-brown"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Search Clothing
                  </span>
                  <span className="text-xs text-vintage-gold">Search</span>
                </button>
              </div>

              {/* Store Location Info Pill */}
              <div className="mt-8 p-4 bg-vintage-ivory rounded border border-vintage-border text-xs text-vintage-muted space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-vintage-gold-dark shrink-0 mt-0.5" />
                  <span>{STORE_CONFIG.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-vintage-gold-dark shrink-0" />
                  <span>{STORE_CONFIG.phoneDisplay}</span>
                </div>
              </div>
            </div>

            {/* Quick shopping action footer */}
            <div className="p-4 border-t border-vintage-border bg-vintage-ivory/30">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartDrawerOpen(true);
                }}
                className="w-full btn-vintage-primary flex items-center justify-center gap-2 py-3"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>VIEW SHOPPING BAG ({cartCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
