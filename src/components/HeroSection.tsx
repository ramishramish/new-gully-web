import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-vintage-cream overflow-hidden border-b border-vintage-border">
      {/* Subtle vintage texture background */}
      <div className="absolute inset-0 vintage-grain opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-vintage-ivory border border-vintage-gold/50 rounded-full text-xs font-semibold tracking-wider text-vintage-brown uppercase">
              <Sparkles className="w-3.5 h-3.5 text-vintage-gold-dark" />
              <span>ESTABLISHED 2016 • PALIKKAL BAZAR, KERALA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-vintage-brown leading-[1.08] tracking-tight">
              TIMELESS STYLE. <br />
              <span className="italic font-normal text-vintage-burgundy font-editorial">
                EVERYDAY COMFORT.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-vintage-muted max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover clothing for every generation at <strong className="text-vintage-brown font-semibold">NEW GULLY</strong>. 
              Classic looks, everyday essentials, and styles that feel right — tailored to celebrate both relaxed weekends and festive moments.
            </p>

            {/* Dual Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/mens"
                className="btn-vintage-primary w-full sm:w-auto flex items-center justify-center gap-2 group py-4 px-8 text-sm"
              >
                <span>SHOP MEN'S COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/kids"
                className="btn-vintage-secondary w-full sm:w-auto flex items-center justify-center gap-2 group py-4 px-8 text-sm"
              >
                <span>SHOP KIDS' COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-vintage-burgundy" />
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-vintage-border/80 text-left">
              <div>
                <p className="font-serif font-bold text-lg text-vintage-brown">100% Cotton</p>
                <p className="text-xs text-vintage-muted">Natural, breathable weaves</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-vintage-brown">Bespoke Fit</p>
                <p className="text-xs text-vintage-muted">Men &amp; young explorers</p>
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-vintage-brown">Palikkal Bazar</p>
                <p className="text-xs text-vintage-muted">Serving Malappuram since 2016</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Double Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Men's Image Card */}
              <div className="relative z-10 overflow-hidden bg-vintage-ivory p-3 shadow-vintage-lg border border-vintage-border group">
               <div className="overflow-hidden aspect-[4/5]">
  <img
    src="/ramish hero.jpeg"
    alt="NEW GULLY Men's Tailored Fashion"
    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
  />
</div>

                <div className="mt-3 flex items-center justify-between text-xs tracking-wider uppercase font-semibold text-vintage-brown">
                  <span>Men's Tailored Linen &amp; Oxford</span>
                  <span className="text-vintage-burgundy">From ₹499</span>
                </div>
              </div>

              {/* Secondary Floating Kids' Image Card */}
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 z-20 w-44 sm:w-56 overflow-hidden bg-vintage-cream p-2.5 shadow-2xl border-2 border-vintage-gold group hidden sm:block">
                <div className="overflow-hidden aspect-square">
                  <img
                    src="/team.jpeg "
                    alt="NEW GULLY Kids' Fashion"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="mt-2 text-center text-[11px] font-bold tracking-wider uppercase text-vintage-brown">
                  <span>Kids' Play &amp; Party</span>
                </div>
              </div>

              {/* Decorative Vintage Stamp */}
              <div className="absolute -top-5 -right-5 z-20 w-24 h-24 rounded-full bg-vintage-burgundy text-vintage-cream flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 border-vintage-cream transform rotate-12">
                <span className="text-[10px] tracking-widest uppercase font-bold text-vintage-gold">NEW GULLY</span>
                <span className="text-xs font-serif font-bold leading-tight">ORIGINAL</span>
                <span className="text-[9px] tracking-wider text-vintage-cream/80">SINCE 2016</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
