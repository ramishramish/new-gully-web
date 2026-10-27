import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { STORE_CONFIG, getWhatsAppEnquiryUrl } from '../data/storeConfig';

export const LocationSection: React.FC = () => {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-vintage-ivory/60 border-b border-vintage-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block mb-1">
            VISIT OUR PHYSICAL BOUTIQUE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-vintage-brown">
            Store Location
          </h2>
          <div className="w-12 h-0.5 bg-vintage-gold mx-auto my-3" />
          <p className="text-sm text-vintage-muted">
            Experience our fabrics in person, receive custom size assistance, and discover our full offline collections at Palikkal Bazar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Store Details Card */}
          <div className="lg:col-span-5 bg-vintage-cream p-8 rounded border border-vintage-border shadow-vintage flex flex-col justify-between">
            <div className="space-y-6">
              
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-vintage-gold-dark block mb-1">
                  MAIN SHOWROOM
                </span>
                <h3 className="font-serif font-bold text-2xl text-vintage-brown">
                  {STORE_CONFIG.name}
                </h3>
                <p className="text-xs text-vintage-burgundy font-medium mt-0.5">
                  Men's &amp; Kids' Fashion Store • Est. 2016
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 text-sm text-vintage-brown">
                <MapPin className="w-5 h-5 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{STORE_CONFIG.area}</p>
                  <p className="text-vintage-muted text-xs">
                    {STORE_CONFIG.district}, {STORE_CONFIG.state}, {STORE_CONFIG.country}
                  </p>
                  <p className="text-[11px] text-vintage-gold-dark mt-1 font-medium">
                    Landmark: Near Palikkal Town Center
                  </p>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-start space-x-3 text-sm text-vintage-brown pt-4 border-t border-vintage-border">
                <Clock className="w-5 h-5 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-vintage-brown">Business Hours:</p>
                  <p className="text-vintage-muted">Monday – Friday: {STORE_CONFIG.businessHours.weekdays}</p>
                  <p className="text-vintage-muted">Saturday – Sunday: {STORE_CONFIG.businessHours.weekends}</p>
                  <p className="text-[11px] text-vintage-olive font-semibold">{STORE_CONFIG.businessHours.note}</p>
                </div>
              </div>

              {/* Phone & Assistance */}
              <div className="flex items-start space-x-3 text-sm text-vintage-brown pt-4 border-t border-vintage-border">
                <Phone className="w-5 h-5 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-vintage-brown">Store Inquiries:</p>
                  <p className="text-vintage-muted">{STORE_CONFIG.phoneDisplay}</p>
                  <p className="text-[10px] text-vintage-muted mt-0.5">
                    Assistance with sizing, stock check, and wedding orders.
                  </p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-vintage-border mt-6 space-y-2">
              <a
                href={STORE_CONFIG.maps.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-vintage-primary flex items-center justify-center gap-2 py-3 text-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS ON GOOGLE MAPS</span>
              </a>

              <a
                href={STORE_CONFIG.maps.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-vintage-secondary flex items-center justify-center gap-2 py-2 text-xs"
              >
                <span>OPEN IN GOOGLE MAPS APP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Embedded Map */}
          <div className="lg:col-span-7 bg-vintage-sand rounded border border-vintage-border overflow-hidden shadow-vintage relative min-h-[360px] flex flex-col">
            <iframe
              title="NEW GULLY Store Location Palikkal Bazar"
              src={STORE_CONFIG.maps.embedUrl}
              className="w-full h-full flex-1 border-0"
              loading="lazy"
              allowFullScreen
              onLoad={() => setMapLoaded(true)}
            />

            {/* Fallback & Overlay banner if map slow or blocked */}
            <div className="bg-vintage-brown text-vintage-cream px-4 py-2.5 text-xs flex items-center justify-between">
              <span className="truncate pr-2">
                📍 {STORE_CONFIG.location}
              </span>
              <a
                href={STORE_CONFIG.maps.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-vintage-gold hover:text-white font-semibold underline shrink-0 inline-flex items-center gap-1"
              >
                Directions Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
