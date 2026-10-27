import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FEATURED_MAIN_CATEGORIES, MENS_SUBCATEGORIES, KIDS_SUBCATEGORIES } from '../data/categories';

export const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-vintage-ivory/50 border-b border-vintage-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 text-vintage-burgundy text-xs font-bold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CURATED DEPARTMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-vintage-brown">
            Featured Collections
          </h2>
          <div className="w-16 h-0.5 bg-vintage-gold mx-auto my-4" />
          <p className="text-sm md:text-base text-vintage-muted">
            Explore carefully selected wardrobes tailored for gentlemen and young boys, marrying heritage craftsmanship with contemporary ease.
          </p>
        </div>

        {/* Dual Category Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {FEATURED_MAIN_CATEGORIES.map((cat) => {
            const isMens = cat.category === 'men';
            const subCats = isMens ? MENS_SUBCATEGORIES : KIDS_SUBCATEGORIES;
            const targetUrl = isMens ? '/mens' : '/kids';

            return (
              <div
                key={cat.id}
                className="group relative bg-vintage-cream rounded border border-vintage-border overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] overflow-hidden bg-vintage-sand">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-vintage-charcoal/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-vintage-cream/90 backdrop-blur-sm px-3 py-1 text-xs font-bold tracking-widest text-vintage-brown uppercase border border-vintage-border">
                    {cat.itemCount}+ STYLES IN STORE
                  </div>

                  {/* Title overlay on mobile */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-wide drop-shadow-md">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-vintage-muted mb-5 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Subcategory Pills */}
                    <div className="mb-6">
                      <p className="text-xs font-bold tracking-wider uppercase text-vintage-brown mb-2.5">
                        Key Styles:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {subCats.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`${targetUrl}?sub=${sub.id}`}
                            className="text-xs px-2.5 py-1 bg-vintage-ivory text-vintage-brown border border-vintage-border/80 rounded hover:border-vintage-burgundy hover:text-vintage-burgundy transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-vintage-border flex items-center justify-between">
                    <Link
                      to={targetUrl}
                      className="btn-vintage-primary w-full flex items-center justify-center gap-2 group-hover:bg-vintage-burgundy"
                    >
                      <span>EXPLORE {cat.name}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
