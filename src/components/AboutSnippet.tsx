import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export const AboutSnippet: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-vintage-sand/30 border-b border-vintage-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg">
              <div className="overflow-hidden bg-vintage-cream p-3 shadow-vintage-lg border border-vintage-border rounded">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
                  alt="NEW GULLY Store Atmosphere"
                  className="w-full h-80 sm:h-96 object-cover rounded"
                />
              </div>

              {/* Inset Badge */}
              <div className="absolute -bottom-6 right-4 sm:-bottom-8 sm:right-6 bg-vintage-brown text-vintage-cream p-5 rounded border border-vintage-gold shadow-2xl max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-vintage-gold" />
                  <span className="font-serif font-bold text-sm tracking-wide text-vintage-gold">
                    Palikkal Bazar, Kerala
                  </span>
                </div>
                <p className="text-[11px] text-vintage-sand leading-relaxed">
                  Proudly rooted in Malappuram district, providing accessible style and warm hospitality.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 text-vintage-burgundy text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OUR HERITAGE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-vintage-brown leading-tight">
              A Decade of Style <br />
              <span className="italic font-editorial text-vintage-burgundy">In Malappuram</span>
            </h2>

            <p className="text-base sm:text-lg text-vintage-brown leading-relaxed font-serif italic">
              "Since 2016, NEW GULLY has been bringing together everyday fashion, comfort, and timeless style. From men's essentials to kids' clothing, we aim to make finding your next favorite outfit simple and enjoyable."
            </p>

            <p className="text-sm text-vintage-muted leading-relaxed">
              What started as a neighbourhood shop in Palikkal Bazar has blossomed into a trusted destination for families looking for crisp formal shirts, sturdy everyday denim, and delightful celebration attire for young boys. We believe quality clothing should never come with unnecessary fuss.
            </p>

            <div className="pt-2">
              <Link
                to="/about"
                className="btn-vintage-primary inline-flex items-center gap-2"
              >
                <span>READ THE FULL STORY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
