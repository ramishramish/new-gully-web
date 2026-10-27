import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) return;

    addToCart(
      product,
      selectedSize || product.sizes[0],
      product.colors[0] || { name: 'Standard', hex: '#000000' },
      1
    );

    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div className="group relative bg-vintage-cream border border-vintage-border hover:border-vintage-gold/80 rounded transition-all duration-300 flex flex-col overflow-hidden shadow-vintage-sm hover:shadow-vintage">
      
      {/* Top Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-vintage-sand">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercentage && product.discountPercentage > 0 && (
            <span className="bg-vintage-burgundy text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-sm shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-vintage-olive text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-sm shadow-sm">
              NEW
            </span>
          )}
          {!product.inStock && (
            <span className="bg-vintage-charcoal text-vintage-sand text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase rounded-sm shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button (Always accessible top right) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-vintage-burgundy text-white shadow-md'
              : 'bg-white/80 text-vintage-brown hover:bg-white hover:text-vintage-burgundy shadow-sm'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button (hover reveal on desktop) */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="w-full py-2 px-3 bg-white/95 backdrop-blur-sm text-vintage-brown hover:text-vintage-burgundy border border-vintage-border text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md transition-all hover:bg-vintage-ivory"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>QUICK VIEW</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory & Stock Tag */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-vintage-muted mb-1 font-medium">
            <span>{product.subCategory.replace('-', ' ')}</span>
            {product.inStock ? (
              <span className="text-vintage-olive-dark font-medium">In Stock</span>
            ) : (
              <span className="text-red-700 font-medium">Out of stock</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif font-bold text-base text-vintage-brown hover:text-vintage-burgundy transition-colors line-clamp-1 mb-1.5">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif font-bold text-lg text-vintage-brown">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-vintage-muted line-through font-normal">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Size Pills (Click to choose before quick adding) */}
          <div className="mb-4">
            <div className="flex items-center gap-1 flex-wrap">
              {product.sizes.slice(0, 5).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`text-[10px] font-semibold px-2 py-0.5 border rounded-sm transition-colors ${
                    selectedSize === size
                      ? 'bg-vintage-brown text-vintage-cream border-vintage-brown'
                      : 'bg-vintage-ivory text-vintage-brown border-vintage-border hover:border-vintage-gold'
                  }`}
                >
                  {size}
                </button>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-[10px] text-vintage-muted">+{product.sizes.length - 5}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Add to Cart */}
        <div>
          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleQuickAdd}
            className={`w-full py-2.5 px-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 rounded-sm ${
              !product.inStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                : isAddedAnimation
                ? 'bg-vintage-olive text-white border border-vintage-olive'
                : 'bg-vintage-brown text-vintage-cream hover:bg-vintage-burgundy border border-vintage-brown hover:border-vintage-burgundy'
            }`}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED TO BAG</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.inStock ? `ADD TO BAG (${selectedSize})` : 'OUT OF STOCK'}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
