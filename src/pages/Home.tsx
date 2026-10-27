import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { HeroSection } from '../components/HeroSection';
import { FeaturedCategories } from '../components/FeaturedCategories';
import { ProductCard } from '../components/ProductCard';
import { SpecialOffersSection } from '../components/SpecialOffersSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { AboutSnippet } from '../components/AboutSnippet';
import { ReviewsSection } from '../components/ReviewsSection';
import { LocationSection } from '../components/LocationSection';
import { Newsletter } from '../components/Newsletter';
import { ALL_PRODUCTS } from '../data/products';

export const Home: React.FC = () => {
  const trendingProducts = ALL_PRODUCTS.filter((p) => p.isTrending || p.isFeatured).slice(0, 8);

  return (
    <PageTransition>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Categories (Men's & Kids') */}
      <FeaturedCategories />

      {/* 3. Trending Products Section */}
      <section className="py-16 md:py-24 bg-vintage-cream border-b border-vintage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-vintage-burgundy text-xs font-bold tracking-widest uppercase mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SEASONAL FAVORITES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-vintage-brown">
                Trending at NEW GULLY
              </h2>
              <div className="w-16 h-0.5 bg-vintage-gold mt-3" />
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/mens"
                className="text-xs font-bold uppercase tracking-wider text-vintage-brown hover:text-vintage-burgundy px-3 py-1.5 bg-vintage-ivory border border-vintage-border rounded transition-colors"
              >
                Men's Styles →
              </Link>
              <Link
                to="/kids"
                className="text-xs font-bold uppercase tracking-wider text-vintage-brown hover:text-vintage-burgundy px-3 py-1.5 bg-vintage-ivory border border-vintage-border rounded transition-colors"
              >
                Kids' Styles →
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/mens"
              className="btn-vintage-secondary inline-flex items-center gap-2 py-3.5 px-8 text-xs"
            >
              <span>EXPLORE ALL COLLECTIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Special Offers Section ("THE STYLE SALE") */}
      <SpecialOffersSection />

      {/* 5. Why Choose NEW GULLY? */}
      <WhyChooseUs />

      {/* 6. About Story Snippet */}
      <AboutSnippet />

      {/* 7. Customer Reviews */}
      <ReviewsSection />

      {/* 8. Store Location & Map */}
      <LocationSection />

      {/* 9. Newsletter Section */}
      <Newsletter />
    </PageTransition>
  );
};
