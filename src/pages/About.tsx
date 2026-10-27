import React from 'react';
import { Link } from 'react-router-dom';
import { History, ShieldCheck, Heart, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { STORE_CONFIG } from '../data/storeConfig';

export const About: React.FC = () => {
  return (
    <PageTransition>
      {/* Editorial Hero */}
      <div className="relative bg-vintage-brown text-vintage-cream py-16 md:py-24 border-b border-vintage-gold/50 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-vintage-burgundy text-vintage-gold text-xs font-bold tracking-widest uppercase rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ESTABLISHED 2016 • PALIKKAL BAZAR, KERALA</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight mb-4">
            THE NEW GULLY STORY
          </h1>
          <p className="text-base sm:text-lg text-vintage-sand font-serif italic max-w-2xl mx-auto leading-relaxed">
            "Bringing together everyday fashion, honest comfort, and timeless style for families across Malappuram."
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Story Section 1: The Origin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block">
              OUR BEGINNINGS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-vintage-brown">
              Rooted in Palikkal Bazar Since 2016
            </h2>
            <div className="w-16 h-0.5 bg-vintage-gold" />
            
            <p className="text-sm text-vintage-muted leading-relaxed">
              In 2016, <strong>NEW GULLY</strong> opened its doors in Palikkal Bazar, a vibrant commercial crossroads in Malappuram district, Kerala. Our vision was straightforward: build a neighbourhood clothing boutique where local men and parents could find genuinely comfortable, well-tailored apparel without having to travel to distant city malls.
            </p>

            <p className="text-sm text-vintage-muted leading-relaxed">
              From our first collection of pure cotton shirts and durable trousers to our expanding lineup of cheerful boys' celebration sets, we have treated every customer who walks through our doors as an extension of our extended family.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-vintage-cream p-3 rounded border border-vintage-border shadow-vintage-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80"
                alt="NEW GULLY Tailored Weaves"
                className="w-full h-80 sm:h-96 object-cover rounded"
              />
            </div>
          </div>
        </div>

        {/* Story Section 2: Craft & Comfort */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="bg-vintage-cream p-3 rounded border border-vintage-border shadow-vintage-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80"
                alt="NEW GULLY Kids Apparel"
                className="w-full h-80 sm:h-96 object-cover rounded"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block">
              OUR PHILOSOPHY
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-vintage-brown">
              Everyday Fashion, Uncompromised Comfort
            </h2>
            <div className="w-16 h-0.5 bg-vintage-gold" />

            <p className="text-sm text-vintage-muted leading-relaxed">
              Living in Kerala means clothing must respond gracefully to tropical warmth, sudden monsoon showers, and long festive days. We hand-select fabrics prioritizing high breathability, natural cotton combs, flexible stretch weaves, and durable seam stitching.
            </p>

            <p className="text-sm text-vintage-muted leading-relaxed">
              Whether you are selecting a crisp formal shirt for an interview, rugged stretch jeans for a coastal road trip, or a mini-gentleman waistcoat for your son's birthday, NEW GULLY is dedicated to clothing that feels effortless from sunrise to sunset.
            </p>
          </div>
        </div>

        {/* Three Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-vintage-ivory/60 rounded border border-vintage-border">
            <ShieldCheck className="w-8 h-8 text-vintage-gold mb-4" />
            <h3 className="font-serif font-bold text-lg text-vintage-brown mb-2">
              Honest Quality
            </h3>
            <p className="text-xs text-vintage-muted leading-relaxed">
              No misleading labels or inflated margins. What you see is genuine fabric, pre-shrunk resilience, and thoughtful finishing.
            </p>
          </div>

          <div className="p-8 bg-vintage-ivory/60 rounded border border-vintage-border">
            <Heart className="w-8 h-8 text-vintage-burgundy mb-4" />
            <h3 className="font-serif font-bold text-lg text-vintage-brown mb-2">
              Generational Style
            </h3>
            <p className="text-xs text-vintage-muted leading-relaxed">
              Styles that look natural on young adults, working professionals, and children alike, honoring both modern tastes and regional traditions.
            </p>
          </div>

          <div className="p-8 bg-vintage-ivory/60 rounded border border-vintage-border">
            <History className="w-8 h-8 text-vintage-olive mb-4" />
            <h3 className="font-serif font-bold text-lg text-vintage-brown mb-2">
              Ten Years of Trust
            </h3>
            <p className="text-xs text-vintage-muted leading-relaxed">
              Serving Palikkal Bazar and neighboring towns with warmth, personalized fittings, and dependable after-sales care since 2016.
            </p>
          </div>
        </div>

        {/* Visit Our Boutique Callout */}
        <div className="bg-vintage-brown text-vintage-cream p-8 md:p-12 rounded border border-vintage-gold/50 shadow-vintage-lg text-center max-w-3xl mx-auto space-y-6">
          <MapPin className="w-8 h-8 text-vintage-gold mx-auto" />
          <h3 className="font-serif font-bold text-2xl md:text-3xl text-vintage-cream">
            Experience NEW GULLY in Palikkal Bazar
          </h3>
          <p className="text-sm text-vintage-sand leading-relaxed max-w-xl mx-auto font-light">
            We invite you to step into our Palikkal showroom, explore our fabrics by hand, and enjoy genuine Malappuram hospitality.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="btn-vintage-gold inline-flex items-center gap-2 text-xs py-3 px-8"
            >
              <span>GET STORE DIRECTIONS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </PageTransition>
  );
};
