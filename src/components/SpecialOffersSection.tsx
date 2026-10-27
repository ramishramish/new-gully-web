import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Clock, Sparkles } from 'lucide-react';
import { PROMOTIONAL_OFFERS } from '../data/offers';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';

export const SpecialOffersSection: React.FC = () => {
  const mainOffer = PROMOTIONAL_OFFERS[0];
  const offerProducts = ALL_PRODUCTS.filter((p) => (p.discountPercentage ?? 0) >= 22).slice(0, 4);

  // Genuine countdown calculation towards configured promotional end date
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 44,
    hours: 12,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date(`${mainOffer.validUntil}T23:59:59`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mainOffer.validUntil]);

  return (
    <section className="py-16 md:py-24 bg-vintage-ivory border-b border-vintage-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Promotion Banner */}
        <div className="bg-vintage-brown text-vintage-cream rounded p-8 md:p-12 border border-vintage-gold/50 shadow-vintage-lg mb-14 relative overflow-hidden">
          {/* Subtle decorative vintage stamp */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <span className="font-display text-9xl font-extrabold tracking-widest text-vintage-gold">NG</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-vintage-burgundy rounded text-xs font-bold tracking-widest uppercase text-vintage-cream">
                <Tag className="w-3 h-3 text-vintage-gold" />
                <span>{mainOffer.discountBadge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight text-vintage-cream">
                {mainOffer.title}
              </h2>

              <p className="text-vintage-sand text-sm md:text-base max-w-xl leading-relaxed">
                {mainOffer.description} Use code <strong className="text-vintage-gold font-mono tracking-widest">{mainOffer.code}</strong> at checkout for valid savings.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  to="/offers"
                  className="btn-vintage-gold flex items-center gap-2 text-xs py-3 px-6"
                >
                  <span>SHOP OFFERS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <span className="text-xs text-vintage-sand/80">
                  Valid until {new Date(mainOffer.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="lg:col-span-4 bg-vintage-brown-dark/70 p-6 rounded border border-vintage-border-dark text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-vintage-gold uppercase tracking-wider mb-3">
                <Clock className="w-4 h-4" />
                <span>Promotion Ends In</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-vintage-cream">
                <div className="bg-vintage-brown p-2.5 rounded border border-vintage-gold/20">
                  <span className="font-serif text-2xl md:text-3xl font-bold block">{timeLeft.days}</span>
                  <span className="text-[10px] uppercase text-vintage-muted-light">Days</span>
                </div>
                <div className="bg-vintage-brown p-2.5 rounded border border-vintage-gold/20">
                  <span className="font-serif text-2xl md:text-3xl font-bold block">{timeLeft.hours}</span>
                  <span className="text-[10px] uppercase text-vintage-muted-light">Hours</span>
                </div>
                <div className="bg-vintage-brown p-2.5 rounded border border-vintage-gold/20">
                  <span className="font-serif text-2xl md:text-3xl font-bold block">{timeLeft.minutes}</span>
                  <span className="text-[10px] uppercase text-vintage-muted-light">Mins</span>
                </div>
                <div className="bg-vintage-brown p-2.5 rounded border border-vintage-gold/20">
                  <span className="font-serif text-2xl md:text-3xl font-bold block">{timeLeft.seconds}</span>
                  <span className="text-[10px] uppercase text-vintage-muted-light">Secs</span>
                </div>
              </div>

              <p className="text-[10px] text-vintage-muted-light mt-3">
                Configured season end date • Store &amp; Online
              </p>
            </div>

          </div>
        </div>

        {/* Selected Styles on Sale */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-serif font-bold text-2xl text-vintage-brown">
              Featured Sale Selections
            </h3>
            <p className="text-xs text-vintage-muted">
              Hand-picked seasonal discounts on premium shirts, jeans &amp; kids outfits
            </p>
          </div>
          <Link
            to="/offers"
            className="text-xs font-bold uppercase tracking-wider text-vintage-burgundy hover:text-vintage-brown flex items-center gap-1 transition-colors"
          >
            <span>View All ({PROMOTIONAL_OFFERS.length} Offers)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
