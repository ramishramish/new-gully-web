import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Check, Copy, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { PROMOTIONAL_OFFERS } from '../data/offers';
import { ALL_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export const Offers: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'men' | 'kids'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredOffers = PROMOTIONAL_OFFERS.filter((offer) => {
    if (filterCategory === 'all') return true;
    return offer.targetCategory === 'all' || offer.targetCategory === filterCategory;
  });

  const offerProducts = ALL_PRODUCTS.filter((p) => (p.discountPercentage ?? 0) > 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <PageTransition>
      {/* Banner */}
      <div className="bg-vintage-burgundy text-vintage-cream py-14 md:py-20 border-b border-vintage-burgundy-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-vintage-burgundy-dark text-vintage-gold text-xs font-bold tracking-widest uppercase rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASONAL SPECIALS</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight mb-4">
            PROMOTIONS &amp; OFFERS
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-vintage-sand/90 font-light leading-relaxed">
            Discover verified seasonal savings on classic men's shirts, trousers, jeans, and kids' party collections. 
            All promotional vouchers are valid both online and at our Palikkal Bazar store.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Category Filters for Offers */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              filterCategory === 'all'
                ? 'bg-vintage-brown text-vintage-cream'
                : 'bg-vintage-ivory text-vintage-brown hover:bg-vintage-sand'
            }`}
          >
            All Offers ({PROMOTIONAL_OFFERS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('men')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              filterCategory === 'men'
                ? 'bg-vintage-brown text-vintage-cream'
                : 'bg-vintage-ivory text-vintage-brown hover:bg-vintage-sand'
            }`}
          >
            Men's Offers
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('kids')}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              filterCategory === 'kids'
                ? 'bg-vintage-brown text-vintage-cream'
                : 'bg-vintage-ivory text-vintage-brown hover:bg-vintage-sand'
            }`}
          >
            Kids' Offers
          </button>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-vintage-cream rounded border border-vintage-border shadow-vintage hover:shadow-vintage-lg transition-all p-6 md:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-vintage-burgundy text-white text-xs font-bold px-3 py-1 uppercase rounded-sm">
                    {offer.discountBadge}
                  </span>
                  <span className="text-[11px] text-vintage-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-vintage-gold-dark" />
                    Valid till {new Date(offer.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-2xl text-vintage-brown mb-1">
                  {offer.title}
                </h3>
                <p className="text-xs text-vintage-gold-dark font-semibold mb-3">
                  {offer.subtitle}
                </p>

                <p className="text-xs text-vintage-muted leading-relaxed mb-6">
                  {offer.description}
                </p>

                {/* Voucher Code Box */}
                <div className="bg-vintage-ivory p-3 rounded border border-vintage-border/80 flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] uppercase text-vintage-muted block">Promo Code:</span>
                    <strong className="font-mono text-base tracking-widest text-vintage-brown">
                      {offer.code}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className="p-2 text-vintage-brown hover:text-vintage-burgundy text-xs flex items-center gap-1 font-semibold"
                    title="Copy code"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-4 h-4 text-vintage-olive" />
                        <span className="text-vintage-olive text-[11px]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[11px]">COPY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Terms & Conditions list */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-vintage-brown block mb-2">
                    Terms &amp; Conditions:
                  </span>
                  <ul className="space-y-1 text-[11px] text-vintage-muted list-disc list-inside">
                    {offer.terms.map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={offer.targetCategory === 'kids' ? '/kids' : '/mens'}
                className="btn-vintage-primary w-full flex items-center justify-center gap-2 text-xs py-3"
              >
                <span>SHOP ELIGIBLE STYLES</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Eligible Discounted Catalog Grid */}
        <div className="pt-12 border-t border-vintage-border">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block mb-1">
              CURRENT SALE SELECTIONS
            </span>
            <h2 className="text-3xl font-serif font-bold text-vintage-brown">
              Selected Styles at Special Prices
            </h2>
            <div className="w-12 h-0.5 bg-vintage-gold mx-auto my-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};
