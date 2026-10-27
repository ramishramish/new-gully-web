import React from 'react';
import { Star, MessageSquareQuote, Info } from 'lucide-react';
import { SAMPLE_REVIEWS } from '../data/reviews';

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-vintage-cream border-b border-vintage-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block mb-1">
            VOICES OF SATISFACTION
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-vintage-brown">
            Customer Reflections
          </h2>
          <div className="w-12 h-0.5 bg-vintage-gold mx-auto my-3" />
          
          {/* Demonstration Notice */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-vintage-ivory rounded text-[11px] text-vintage-muted border border-vintage-border">
            <Info className="w-3.5 h-3.5 text-vintage-gold-dark" />
            <span>Sample customer testimonials for demonstration preview</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-vintage-ivory/70 p-6 rounded border border-vintage-border flex flex-col justify-between hover:shadow-vintage transition-all duration-300"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3 text-vintage-gold">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <h4 className="font-serif font-bold text-base text-vintage-brown mb-2 leading-snug">
                  "{rev.title}"
                </h4>

                <p className="text-xs text-vintage-muted leading-relaxed mb-6 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Location */}
              <div className="pt-4 border-t border-vintage-border/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-vintage-brown">{rev.author}</h5>
                  <p className="text-[10px] text-vintage-muted">{rev.location}</p>
                </div>
                <span className="text-[9px] text-vintage-muted uppercase bg-vintage-cream px-1.5 py-0.5 rounded border border-vintage-border">
                  Demo
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
