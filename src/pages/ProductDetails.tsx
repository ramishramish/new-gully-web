import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Check, ArrowLeft, Ruler, Truck, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { ProductCard } from '../components/ProductCard';
import { ALL_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../data/storeConfig';
import { ProductColor } from '../types';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, setIsSizeGuideOpen } = useCart();

  const product = ALL_PRODUCTS.find((p) => p.id === id);

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0] || '');
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || null);
      setQuantity(1);
      setSizeError(false);
      window.scrollTo(0, 0);
    }
  }, [product, id]);

  if (!product) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif font-bold text-3xl text-vintage-brown mb-4">
            Style Not Found
          </h2>
          <p className="text-sm text-vintage-muted mb-8">
            The requested clothing piece may have been updated or moved to our archives.
          </p>
          <Link to="/mens" className="btn-vintage-primary py-3 px-8 text-xs">
            RETURN TO CATALOG
          </Link>
        </div>
      </PageTransition>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const relatedProducts = ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    addToCart(
      product,
      selectedSize,
      selectedColor || product.colors[0] || { name: 'Standard', hex: '#000000' },
      quantity
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <PageTransition>
      <div className="bg-vintage-cream min-h-screen py-8 md:py-12 border-b border-vintage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center space-x-2 text-xs text-vintage-muted mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-vintage-brown">Home</Link>
            <span>/</span>
            <Link
              to={product.category === 'men' ? '/mens' : '/kids'}
              className="hover:text-vintage-brown capitalize"
            >
              {product.category === 'men' ? "Men's Collection" : "Kids' Collection"}
            </Link>
            <span>/</span>
            <span className="text-vintage-brown font-semibold truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
            
            {/* Gallery (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-[4/5] bg-vintage-sand overflow-hidden rounded border border-vintage-border shadow-vintage relative group">
                <img
                  src={activeImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-vintage-burgundy text-white text-xs font-bold px-3 py-1 uppercase rounded-sm shadow-md">
                    {product.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-24 rounded overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img
                          ? 'border-vintage-gold shadow-md'
                          : 'border-vintage-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Specifications (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-vintage-gold-dark">
                    NEW GULLY ORIGINAL
                  </span>
                  <span className="text-xs text-vintage-border">•</span>
                  <span className="text-xs uppercase tracking-wider text-vintage-muted">
                    {product.subCategory.replace('-', ' ')}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-vintage-brown mb-3">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif font-bold text-3xl text-vintage-brown">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-base text-vintage-muted line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-vintage-burgundy bg-vintage-burgundy/10 px-2 py-0.5 rounded">
                        Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-vintage-muted">
                  Prices inclusive of all applicable taxes. Demonstration retail price.
                </p>
              </div>

              {/* Description */}
              <div className="py-4 border-y border-vintage-border">
                <p className="text-sm text-vintage-muted leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color swatches */}
              {product.colors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                      Color Shade: <span className="font-normal text-vintage-muted">{selectedColor?.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                          selectedColor?.name === color.name
                            ? 'border-vintage-gold scale-110 shadow-sm'
                            : 'border-vintage-border hover:scale-105'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="block w-full h-full rounded-full border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector with Size Guide Trigger */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                    Select Size <span className="text-vintage-burgundy">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs font-semibold text-vintage-burgundy hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Fit &amp; Size Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`min-w-[48px] h-11 px-3 flex items-center justify-center text-xs font-bold tracking-wider border rounded transition-all ${
                        selectedSize === size
                          ? 'bg-vintage-brown text-vintage-cream border-vintage-brown shadow-sm'
                          : 'bg-vintage-ivory text-vintage-brown border-vintage-border hover:border-vintage-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {sizeError && (
                  <p className="mt-2 text-xs text-vintage-burgundy font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Please pick your preferred size to proceed.
                  </p>
                )}
              </div>

              {/* Quantity Selector & Stock Indicator */}
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown block mb-1">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center border border-vintage-border bg-vintage-ivory rounded">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-vintage-brown hover:text-vintage-burgundy font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-vintage-brown min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stockCount ?? 15, quantity + 1))}
                      className="px-3 py-1.5 text-vintage-brown hover:text-vintage-burgundy font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-vintage-muted block mb-0.5">Stock Status:</span>
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-vintage-olive">
                      <Check className="w-3.5 h-3.5" /> In Stock at Palikkal Store ({product.stockCount} available)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-600">Currently Sold Out</span>
                  )}
                </div>
              </div>

              {/* Primary Actions */}
              <div className="pt-4 space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 px-6 text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded ${
                      !product.inStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : addedAnimation
                        ? 'bg-vintage-olive text-white'
                        : 'bg-vintage-brown text-vintage-cream hover:bg-vintage-burgundy'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO SHOPPING BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO SHOPPING BAG</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`p-4 border rounded transition-colors ${
                      isWishlisted
                        ? 'bg-vintage-burgundy text-white border-vintage-burgundy'
                        : 'border-vintage-border hover:border-vintage-burgundy text-vintage-brown'
                    }`}
                    title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-vintage-border grid grid-cols-2 gap-3 text-xs text-vintage-muted">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-vintage-gold-dark shrink-0" />
                  <span>Free shipping above ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-vintage-gold-dark shrink-0" />
                  <span>7-Day In-Store Exchanges</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-vintage-gold-dark shrink-0" />
                  <span>100% Verified Cotton Weaves</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vintage-gold-dark shrink-0" />
                  <span>Palikkal Bazar Boutique</span>
                </div>
              </div>

            </div>

          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t border-vintage-border">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold-dark block mb-1">
                  COORDINATING PIECES
                </span>
                <h3 className="font-serif font-bold text-2xl md:text-3xl text-vintage-brown">
                  Complete Your Look
                </h3>
                <div className="w-12 h-0.5 bg-vintage-gold mx-auto my-3" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};
