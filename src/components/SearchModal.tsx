import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ALL_PRODUCTS } from '../data/products';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim() === ''
    ? []
    : ALL_PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });

  const handleSelectProduct = (id: string) => {
    setIsSearchOpen(false);
    navigate(`/product/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-vintage-charcoal/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="min-h-screen px-4 text-center flex items-start justify-center pt-16 md:pt-24 pb-8">
        <div className="inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-vintage-cream shadow-2xl rounded border border-vintage-border relative z-10">
          
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-vintage-border bg-vintage-ivory/60">
            <Search className="w-5 h-5 text-vintage-gold-dark shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by shirt, trouser, cotton, jeans, kids..."
              className="w-full bg-transparent border-none text-vintage-brown placeholder-vintage-muted/70 focus:outline-none text-base font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-vintage-muted hover:text-vintage-brown mr-1 text-xs"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 text-vintage-muted hover:text-vintage-burgundy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions when empty */}
          {query.trim() === '' && (
            <div className="p-6 text-xs space-y-4">
              <span className="font-bold tracking-wider uppercase text-vintage-brown block">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Oxford Cotton Shirt', 'Formal Trousers', 'Stretch Jeans', 'Kids T-Shirt', 'Kasavu Kurta', 'Linen Shirt'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-vintage-ivory text-vintage-brown border border-vintage-border rounded hover:border-vintage-gold flex items-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-vintage-gold" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() !== '' && (
            <div className="max-h-96 overflow-y-auto p-4 divide-y divide-vintage-border/60">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-vintage-muted text-sm">
                  No styles matched "<span className="text-vintage-brown font-semibold">{query}</span>".
                </div>
              ) : (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="py-3 px-3 flex items-center justify-between hover:bg-vintage-ivory/80 rounded cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-14 object-cover rounded border border-vintage-border shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-vintage-gold-dark">
                            {p.category === 'men' ? "Men" : "Kids"}
                          </span>
                          <span className="text-[10px] text-vintage-muted capitalize">
                            • {p.subCategory.replace('-', ' ')}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-vintage-brown group-hover:text-vintage-burgundy transition-colors">
                          {p.name}
                        </h4>
                        <span className="text-xs font-semibold text-vintage-brown">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-vintage-muted group-hover:text-vintage-burgundy transition-transform group-hover:translate-x-1" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="px-4 py-2.5 bg-vintage-ivory border-t border-vintage-border text-[11px] text-vintage-muted flex items-center justify-between">
            <span>Press ESC or click outside to dismiss</span>
            <span>{ALL_PRODUCTS.length} total styles indexed</span>
          </div>

        </div>
      </div>
    </div>
  );
};
