import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Search, Sparkles, Check } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { ProductGrid } from '../components/ProductGrid';
import { ALL_PRODUCTS } from '../data/products';
import { MENS_SUBCATEGORIES } from '../data/categories';
import { MensSubCategory } from '../types';

export const MensCollection: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subCategoryParam = searchParams.get('sub') as MensSubCategory | null;

  // Filter & Sorting States
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(subCategoryParam || 'all');
  const [selectedSort, setSelectedSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(2000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync with URL query parameter
  useEffect(() => {
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
    }
  }, [subCategoryParam]);

  const mensProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => p.category === 'men');
  }, []);

  const filteredProducts = useMemo(() => {
    return mensProducts.filter((product) => {
      // Subcategory filter
      if (selectedSubCategory !== 'all' && product.subCategory !== selectedSubCategory) {
        return false;
      }
      // Price range
      if (product.price > priceRange) {
        return false;
      }
      // Size filter
      if (selectedSize !== 'all' && !product.sizes.includes(selectedSize)) {
        return false;
      }
      // Discount filter
      if (discountOnly && (!product.discountPercentage || product.discountPercentage <= 0)) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesFabric = product.fabric.toLowerCase().includes(q);
        const matchesSub = product.subCategory.toLowerCase().includes(q);
        if (!matchesName && !matchesFabric && !matchesSub) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      if (selectedSort === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0; // featured default
    });
  }, [mensProducts, selectedSubCategory, selectedSort, selectedSize, discountOnly, searchQuery, priceRange]);

  const resetAllFilters = () => {
    setSelectedSubCategory('all');
    setSelectedSort('featured');
    setSelectedSize('all');
    setDiscountOnly(false);
    setSearchQuery('');
    setPriceRange(2000);
    setSearchParams({});
  };

  const handleSubCategoryChange = (subId: string) => {
    setSelectedSubCategory(subId);
    if (subId === 'all') {
      searchParams.delete('sub');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ sub: subId });
    }
  };

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40', '42'];

  return (
    <PageTransition>
      {/* Editorial Banner */}
      <div className="relative bg-vintage-brown text-vintage-cream py-14 md:py-20 border-b border-vintage-gold/40 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-vintage-burgundy text-vintage-cream text-xs font-bold tracking-widest uppercase rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-vintage-gold" />
            <span>ESTABLISHED 2016 • PALIKKAL BAZAR</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold text-vintage-cream tracking-tight mb-4">
            MEN'S COLLECTION
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-vintage-sand font-light leading-relaxed">
            From tailored oxford shirts and breezy linens to all-day comfort trousers and authentic stretch denim. 
            Meticulously crafted for work, celebrations, and relaxed Kerala evenings.
          </p>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Top Control Bar (Search, Count, Mobile Filter Trigger, Sort) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 mb-8 border-b border-vintage-border">
          
          {/* Search in collection */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-vintage-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search men's styles..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-vintage-ivory border border-vintage-border rounded focus:outline-none focus:ring-1 focus:ring-vintage-gold text-vintage-brown"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-vintage-muted hover:text-vintage-brown text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results count & Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 py-2 px-3 bg-vintage-ivory border border-vintage-border rounded text-xs font-bold text-vintage-brown"
            >
              <SlidersHorizontal className="w-4 h-4 text-vintage-burgundy" />
              <span>Filters ({[selectedSubCategory !== 'all', selectedSize !== 'all', discountOnly].filter(Boolean).length})</span>
            </button>

            <span className="text-xs text-vintage-muted hidden sm:inline">
              Showing <strong className="text-vintage-brown">{filteredProducts.length}</strong> styles
            </span>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-vintage-muted shrink-0 hidden sm:block" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="py-2 px-3 text-xs bg-vintage-ivory border border-vintage-border rounded text-vintage-brown font-semibold focus:outline-none focus:ring-1 focus:ring-vintage-gold"
              >
                <option value="featured">Sort by: Featured Styles</option>
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Desktop Sidebar + Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 bg-vintage-ivory/50 p-6 rounded border border-vintage-border sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-vintage-border">
              <h3 className="font-serif font-bold text-base text-vintage-brown flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-vintage-gold-dark" />
                <span>Filter Wardrobe</span>
              </h3>
              {(selectedSubCategory !== 'all' || selectedSize !== 'all' || discountOnly || searchQuery) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] text-vintage-burgundy font-semibold hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Subcategories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown mb-3">
                Categories
              </h4>
              <div className="space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange('all')}
                  className={`w-full text-left py-1.5 px-2.5 rounded transition-colors flex items-center justify-between ${
                    selectedSubCategory === 'all'
                      ? 'bg-vintage-brown text-vintage-cream font-bold'
                      : 'text-vintage-muted hover:bg-vintage-ivory hover:text-vintage-brown'
                  }`}
                >
                  <span>All Men's Styles</span>
                  <span className="text-[10px] opacity-75">{mensProducts.length}</span>
                </button>
                {MENS_SUBCATEGORIES.map((sub) => {
                  const count = mensProducts.filter((p) => p.subCategory === sub.id).length;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubCategoryChange(sub.id)}
                      className={`w-full text-left py-1.5 px-2.5 rounded transition-colors flex items-center justify-between ${
                        selectedSubCategory === sub.id
                          ? 'bg-vintage-brown text-vintage-cream font-bold'
                          : 'text-vintage-muted hover:bg-vintage-ivory hover:text-vintage-brown'
                      }`}
                    >
                      <span>{sub.name}</span>
                      <span className="text-[10px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-vintage-border">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                  Max Price
                </h4>
                <span className="text-xs font-bold text-vintage-burgundy">
                  ₹{priceRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="2000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-vintage-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-vintage-muted mt-1">
                <span>₹400</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="pt-4 border-t border-vintage-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown mb-2.5">
                Available Sizes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSize('all')}
                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                    selectedSize === 'all'
                      ? 'bg-vintage-brown text-vintage-cream border-vintage-brown'
                      : 'bg-vintage-cream text-vintage-brown border-vintage-border hover:border-vintage-gold'
                  }`}
                >
                  All
                </button>
                {allSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size === selectedSize ? 'all' : size)}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                      selectedSize === size
                        ? 'bg-vintage-brown text-vintage-cream border-vintage-brown'
                        : 'bg-vintage-cream text-vintage-brown border-vintage-border hover:border-vintage-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Offers toggle */}
            <div className="pt-4 border-t border-vintage-border">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-vintage-brown font-medium">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="rounded border-vintage-border text-vintage-burgundy focus:ring-vintage-gold w-4 h-4 accent-vintage-burgundy"
                />
                <span>Sale Items Only (20%+ Off)</span>
              </label>
            </div>

          </aside>

          {/* Product Grid Area (9 cols) */}
          <main className="lg:col-span-9">
            {/* Active filters badges */}
            {(selectedSubCategory !== 'all' || selectedSize !== 'all' || discountOnly || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-vintage-ivory/60 rounded border border-vintage-border text-xs">
                <span className="font-bold text-vintage-brown">Active Filters:</span>
                {selectedSubCategory !== 'all' && (
                  <span className="bg-vintage-cream px-2.5 py-1 rounded border border-vintage-border text-vintage-brown flex items-center gap-1">
                    Category: {selectedSubCategory}
                    <button type="button" onClick={() => handleSubCategoryChange('all')}>✕</button>
                  </span>
                )}
                {selectedSize !== 'all' && (
                  <span className="bg-vintage-cream px-2.5 py-1 rounded border border-vintage-border text-vintage-brown flex items-center gap-1">
                    Size: {selectedSize}
                    <button type="button" onClick={() => setSelectedSize('all')}>✕</button>
                  </span>
                )}
                {discountOnly && (
                  <span className="bg-vintage-cream px-2.5 py-1 rounded border border-vintage-border text-vintage-brown flex items-center gap-1">
                    Discounts Only
                    <button type="button" onClick={() => setDiscountOnly(false)}>✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-vintage-cream px-2.5 py-1 rounded border border-vintage-border text-vintage-brown flex items-center gap-1">
                    Keyword: "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery('')}>✕</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-vintage-burgundy font-bold underline ml-auto text-[11px]"
                >
                  Clear All
                </button>
              </div>
            )}

            <ProductGrid
              products={filteredProducts}
              emptyMessage="No men's styles match your selected filters. Try broadening your criteria or reset filters."
              onResetFilters={resetAllFilters}
            />
          </main>

        </div>

      </div>

      {/* Mobile Drawer for Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-vintage-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-vintage-cream shadow-2xl flex flex-col z-10 border-l border-vintage-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-vintage-border mb-6">
              <h3 className="font-serif font-bold text-lg text-vintage-brown">Filter Men's</h3>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 text-vintage-muted hover:text-vintage-brown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Subcategories */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown mb-2.5">
                  Category
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleSubCategoryChange('all');
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded text-xs ${
                      selectedSubCategory === 'all'
                        ? 'bg-vintage-brown text-vintage-cream font-bold'
                        : 'text-vintage-brown hover:bg-vintage-ivory'
                    }`}
                  >
                    All Styles
                  </button>
                  {MENS_SUBCATEGORIES.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        handleSubCategoryChange(sub.id);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded text-xs ${
                        selectedSubCategory === sub.id
                          ? 'bg-vintage-brown text-vintage-cream font-bold'
                          : 'text-vintage-brown hover:bg-vintage-ivory'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t border-vintage-border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                    Max Price
                  </h4>
                  <span className="text-xs font-bold text-vintage-burgundy">
                    ₹{priceRange.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-vintage-gold cursor-pointer"
                />
              </div>

              {/* Sizes */}
              <div className="pt-4 border-t border-vintage-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vintage-brown mb-2.5">
                  Size
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size === selectedSize ? 'all' : size)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded border ${
                        selectedSize === size
                          ? 'bg-vintage-brown text-vintage-cream border-vintage-brown'
                          : 'bg-vintage-ivory text-vintage-brown border-vintage-border'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="pt-4 border-t border-vintage-border">
                <label className="flex items-center space-x-2 text-xs font-medium text-vintage-brown">
                  <input
                    type="checkbox"
                    checked={discountOnly}
                    onChange={(e) => setDiscountOnly(e.target.checked)}
                    className="rounded border-vintage-border text-vintage-burgundy w-4 h-4"
                  />
                  <span>Discounts Only</span>
                </label>
              </div>

              <div className="pt-6 border-t border-vintage-border flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="flex-1 btn-vintage-secondary text-xs py-2.5"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 btn-vintage-primary text-xs py-2.5"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
