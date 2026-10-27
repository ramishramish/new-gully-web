import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export const Wishlist: React.FC = () => {
  const { wishlist } = useCart();

  return (
    <PageTransition>
      <div className="bg-vintage-cream min-h-screen py-10 md:py-16 border-b border-vintage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-vintage-ivory border border-vintage-border flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-vintage-burgundy" />
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-vintage-brown mb-2">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-vintage-muted">
              {wishlist.length} {wishlist.length === 1 ? 'style' : 'styles'} saved for future reference.
            </p>
          </div>

          {wishlist.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12 bg-vintage-ivory/50 rounded border border-vintage-border p-8">
              <p className="text-sm text-vintage-muted mb-6 leading-relaxed">
                You haven't saved any styles yet. Tap the heart icon on any product to keep track of items you adore.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/mens" className="btn-vintage-primary py-3 px-6 text-xs">
                  EXPLORE MEN'S
                </Link>
                <Link to="/kids" className="btn-vintage-secondary py-3 px-6 text-xs">
                  EXPLORE KIDS'
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};
