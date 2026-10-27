import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Search, Smile, Heart } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { ProductGrid } from '../components/ProductGrid';
import { ALL_PRODUCTS } from '../data/products';
import { KIDS_SUBCATEGORIES } from '../data/categories';
import { KidsSubCategory } from '../types';

export const KidsCollection: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subCategoryParam = searchParams.get('sub') as KidsSubCategory | null;

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(subCategoryParam || 'all');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
    }
  }, [subCategoryParam]);

  const kidsProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => p.category === 'kids');
  }, []);

  const filteredProducts = useMemo(() => {
    return kidsProducts.filter((product) => {
      if (selectedSubCategory !== 'all' && product.subCategory !== selectedSubCategory) {
        return false;
      }
      if (selectedAge !== 'all' && !product.sizes.includes(selectedAge)) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.fabric.toLowerCase().includes(q) ||
          product.subCategory.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      return 0;
    });
  }, [kidsProducts, selectedSubCategory, selectedAge, searchQuery, selectedSort]);

  const ageGroups = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];

  return (
    <PageTransition>
      {/* Playful Vintage Hero Banner */}
      <div className="relative bg-vintage-olive text-vintage-cream py-14 md:py-20 border-b border-vintage-gold/50 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-vintage-cream text-vintage-brown text-xs font-bold tracking-widest uppercase rounded-full mb-3 shadow-sm">
            <Smile className="w-4 h-4 text-vintage-burgundy" />
            <span>GENTLE ON SKIN • READY FOR PLAY</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-vintage-cream tracking-tight mb-4">
            KIDS' COLLECTION
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-vintage-sand font-light leading-relaxed">
            Cheerful styles for boys and young explorers. Breathable 100% bio-washed cotton tees, smart check button-downs, 
            flexible straight-fit denim, and mini gentleman waistcoats for celebratory family moments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Category Pills Slider */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-xl text-vintage-brown">
              Browse by Department
            </h3>
            <span className="text-xs text-vintage-muted">
              {kidsProducts.length} styles available
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-vintage-brown text-vintage-cream border-vintage-brown shadow-sm'
                  : 'bg-vintage-ivory text-vintage-brown border-vintage-border hover:border-vintage-gold'
              }`}
            >
              All Kids' Wear
            </button>
            {KIDS_SUBCATEGORIES.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubCategory(sub.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-all ${
                  selectedSubCategory === sub.id
                    ? 'bg-vintage-brown text-vintage-cream border-vintage-brown shadow-sm'
                    : 'bg-vintage-ivory text-vintage-brown border-vintage-border hover:border-vintage-gold'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Age Selector Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-vintage-ivory/60 border border-vintage-border rounded mb-8">
          
          {/* Age Group Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase text-vintage-brown">
              Filter by Age:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAge('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded border ${
                selectedAge === 'all'
                  ? 'bg-vintage-burgundy text-white border-vintage-burgundy'
                  : 'bg-vintage-cream text-vintage-brown border-vintage-border'
              }`}
            >
              All Ages
            </button>
            {ageGroups.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(age === selectedAge ? 'all' : age)}
                className={`px-2.5 py-1 text-xs font-bold rounded border ${
                  selectedAge === age
                    ? 'bg-vintage-burgundy text-white border-vintage-burgundy'
                    : 'bg-vintage-cream text-vintage-brown border-vintage-border hover:border-vintage-gold'
                }`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Sort & Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-vintage-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kid styles..."
                className="pl-8 pr-3 py-1.5 text-xs bg-vintage-cream border border-vintage-border rounded text-vintage-brown focus:outline-none"
              />
            </div>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="py-1.5 px-3 text-xs bg-vintage-cream border border-vintage-border rounded text-vintage-brown font-semibold focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          emptyMessage="No children's styles match your selected filters. Try choosing 'All Ages' or 'All Kids Wear'."
          onResetFilters={() => {
            setSelectedSubCategory('all');
            setSelectedAge('all');
            setSearchQuery('');
          }}
        />

        {/* Quality Guarantee Box */}
        <div className="mt-16 p-8 bg-vintage-sand/30 rounded border border-vintage-border text-center max-w-3xl mx-auto">
          <Heart className="w-8 h-8 text-vintage-burgundy mx-auto mb-3" />
          <h4 className="font-serif font-bold text-xl text-vintage-brown mb-2">
            The NEW GULLY Kids' Comfort Promise
          </h4>
          <p className="text-xs text-vintage-muted leading-relaxed">
            Every piece in our kids' collection is tested for softness, non-irritating seams, and chemical-safe vegetable dyes. 
            Designed to withstand mud, grass, playground climbs, and washing machines without losing fit or color.
          </p>
        </div>

      </div>
    </PageTransition>
  );
};
