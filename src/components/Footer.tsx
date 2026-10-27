import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Heart, ArrowUp, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export const Footer: React.FC = () => {
  const [logoError, setLogoError] = useState(false);
  const [modalPolicy, setModalPolicy] = useState<'privacy' | 'terms' | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-vintage-brown text-vintage-cream pt-16 pb-12 border-t-4 border-vintage-gold relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-vintage-border-dark">
            
            {/* Col 1: Brand & Story (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="inline-block">
                {!logoError ? (
                  <div className="bg-vintage-cream p-2 rounded inline-block">
                    <img
                      src="/images/new-gully-logo.png"
                      alt="NEW GULLY Logo"
                      onError={() => setLogoError(true)}
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="font-display font-bold text-2xl tracking-widest text-vintage-gold block">
                      NEW GULLY
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-vintage-sand font-medium">
                      ESTABLISHED 2016 • PALIKKAL BAZAR
                    </span>
                  </div>
                )}
              </Link>

              <p className="text-xs text-vintage-sand/80 leading-relaxed font-light">
                Since 2016, NEW GULLY has been bringing together everyday fashion, comfort, and timeless style for families across Malappuram, Kerala. From crisp tailored shirts to durable kids wear, quality meets comfort.
              </p>

              {/* Social icons */}
              <div className="flex items-center space-x-3 pt-2">
                <a
                  href={STORE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded bg-vintage-brown-dark flex items-center justify-center text-vintage-sand hover:text-vintage-gold hover:bg-vintage-burgundy transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={STORE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded bg-vintage-brown-dark flex items-center justify-center text-vintage-sand hover:text-vintage-gold hover:bg-vintage-burgundy transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-vintage-gold">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs text-vintage-sand/80">
                <li>
                  <Link to="/" className="hover:text-vintage-gold transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/mens" className="hover:text-vintage-gold transition-colors">Men's Collection</Link>
                </li>
                <li>
                  <Link to="/kids" className="hover:text-vintage-gold transition-colors">Kids' Collection</Link>
                </li>
                <li>
                  <Link to="/offers" className="hover:text-vintage-gold transition-colors">Special Offers</Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-vintage-gold transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-vintage-gold transition-colors">Contact &amp; Store</Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-vintage-gold transition-colors">Shopping Bag</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Popular Categories (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-vintage-gold">
                Featured Styles
              </h4>
              <ul className="space-y-2 text-xs text-vintage-sand/80">
                <li>
                  <Link to="/mens?sub=shirts" className="hover:text-vintage-gold transition-colors">
                    Men's Oxford &amp; Linen Shirts
                  </Link>
                </li>
                <li>
                  <Link to="/mens?sub=trousers" className="hover:text-vintage-gold transition-colors">
                    Formal &amp; Chino Trousers
                  </Link>
                </li>
                <li>
                  <Link to="/mens?sub=jeans" className="hover:text-vintage-gold transition-colors">
                    Slim Fit Stretch Denim
                  </Link>
                </li>
                <li>
                  <Link to="/mens?sub=traditional-wear" className="hover:text-vintage-gold transition-colors">
                    Kerala Traditional Kasavu Sets
                  </Link>
                </li>
                <li>
                  <Link to="/kids?sub=boys-shirts" className="hover:text-vintage-gold transition-colors">
                    Boys' Casual &amp; Party Shirts
                  </Link>
                </li>
                <li>
                  <Link to="/kids?sub=party-wear" className="hover:text-vintage-gold transition-colors">
                    Kids' Festive Waistcoat Outfits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Store & Inquiries (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-vintage-gold">
                Palikkal Store
              </h4>
              <div className="space-y-2.5 text-xs text-vintage-sand/80">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-vintage-gold shrink-0 mt-0.5" />
                  <span>{STORE_CONFIG.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-vintage-gold shrink-0" />
                  <span>{STORE_CONFIG.phoneDisplay}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-vintage-gold shrink-0" />
                  <span>{STORE_CONFIG.email}</span>
                </div>
                <div className="flex items-start space-x-2 pt-1">
                  <Clock className="w-4 h-4 text-vintage-gold shrink-0 mt-0.5" />
                  <div>
                    <p>9:30 AM – 9:30 PM (All 7 Days)</p>
                    <p className="text-[10px] text-vintage-sand/60">Palikkal Bazar, Malappuram</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright, Policies, and Scroll-to-top */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-vintage-sand/70 gap-4">
            <div>
              <p>© 2016–2026 NEW GULLY. All rights reserved.</p>
              <p className="text-[10px] text-vintage-sand/50 mt-0.5">
                Demonstration fashion website built for independent boutique showcase.
              </p>
            </div>

            <div className="flex items-center space-x-6 text-[11px]">
              <button
                type="button"
                onClick={() => setModalPolicy('privacy')}
                className="hover:text-vintage-gold underline underline-offset-4"
              >
                Privacy Notice
              </button>
              <button
                type="button"
                onClick={() => setModalPolicy('terms')}
                className="hover:text-vintage-gold underline underline-offset-4"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                className="p-2 rounded bg-vintage-brown-dark hover:bg-vintage-burgundy text-vintage-sand hover:text-white transition-colors flex items-center gap-1"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>TOP</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Policy Modals */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalPolicy(null)}
          />
          <div className="min-h-screen px-4 flex items-center justify-center py-8">
            <div className="relative bg-vintage-cream text-vintage-brown max-w-lg w-full p-6 md:p-8 rounded shadow-2xl border border-vintage-border z-10 text-left">
              <h3 className="font-serif font-bold text-xl mb-4 text-vintage-brown">
                {modalPolicy === 'privacy' ? 'Privacy Notice' : 'Terms & Conditions'}
              </h3>
              <div className="text-xs text-vintage-muted space-y-3 max-h-72 overflow-y-auto leading-relaxed">
                {modalPolicy === 'privacy' ? (
                  <>
                    <p>
                      At NEW GULLY, we value the trust of our Palikkal Bazar community and website visitors.
                    </p>
                    <p>
                      In this demonstration frontend mode, shopping cart items are stored purely in your local browser storage and order submissions are demonstration simulations. No payment card information is ever requested or held.
                    </p>
                    <p>
                      When a full production backend is configured, customer delivery addresses and mobile numbers are utilized exclusively for delivering your orders and communicating order status.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Welcome to NEW GULLY. By browsing our clothing catalog and utilizing our demonstration store, you acknowledge:
                    </p>
                    <p>
                      1. All demonstration prices in Indian Rupees (₹) are configured for demonstration and may be updated by the store administrator.
                    </p>
                    <p>
                      2. Real store purchases can be finalized directly in-store at Palikkal Bazar or via direct inquiry.
                    </p>
                    <p>
                      3. Returns or exchanges of standard clothing items are accepted in-store within 7 days of purchase in unworn condition with tags intact.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-vintage-border text-right">
                <button
                  type="button"
                  onClick={() => setModalPolicy(null)}
                  className="btn-vintage-primary text-xs py-2 px-5"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
