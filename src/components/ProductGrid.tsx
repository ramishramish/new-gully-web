import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  emptyMessage = "No styles found matching your criteria.",
  onResetFilters
}) => {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center bg-vintage-ivory/40 border border-vintage-border rounded p-8">
        <PackageOpen className="w-12 h-12 text-vintage-gold mx-auto mb-4 stroke-1" />
        <h3 className="font-serif font-bold text-xl text-vintage-brown mb-2">No Matching Styles</h3>
        <p className="text-sm text-vintage-muted max-w-md mx-auto mb-6">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn-vintage-secondary text-xs py-2 px-6"
          >
            RESET ALL FILTERS
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
