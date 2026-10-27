import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, Check, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ProductColor } from '../types';

export const ProductQuickView: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(quickViewProduct.images[0] || '');
      setSelectedSize(quickViewProduct.sizes[0] || '');
      setSelectedColor(quickViewProduct.colors[0] || null);
      setQuantity(1);
      setSizeError(false);
      setAddedSuccess(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewProduct]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickViewProduct) {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const isWishlisted = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    addToCart(
      quickViewProduct,
      selectedSize,
      selectedColor || quickViewProduct.colors[0] || { name: 'Standard', hex: '#000000' },
      quantity
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-vintage-charcoal/70 backdrop-blur-sm transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        <div className="inline-block w-full max-w-4xl p-6 md:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-vintage-cream shadow-2xl rounded border border-vintage-border relative z-10">
          
          {/* Close button */}
          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 p-2 text-vintage-muted hover:text-vintage-burgundy transition-colors rounded-full hover:bg-vintage-ivory focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-vintage-sand overflow-hidden rounded border border-vintage-border shadow-sm">
                <img
                  src={selectedImage || quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnails */}
              {quickViewProduct.images.length > 1 && (
                <div className="flex gap-2">
                  {quickViewProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-20 rounded overflow-hidden border-2 transition-all ${
                        selectedImage === img
                          ? 'border-vintage-gold shadow-sm'
                          : 'border-vintage-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-vintage-gold-dark">
                    {quickViewProduct.category === 'men' ? "Men's Collection" : "Kids' Collection"}
                  </span>
                  <span className="text-xs text-vintage-border">•</span>
                  <span className="text-xs uppercase tracking-wider text-vintage-muted">
                    {quickViewProduct.subCategory.replace('-', ' ')}
                  </span>
                </div>

                {/* Name */}
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-vintage-brown mb-3">
                  {quickViewProduct.name}
                </h2>

                {/* Pricing in INR */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif font-bold text-2xl text-vintage-brown">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </span>
                  {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                    <>
                      <span className="text-sm text-vintage-muted line-through">
                        ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="bg-vintage-burgundy text-white text-xs font-bold px-2 py-0.5 rounded-sm">
                        SAVE {quickViewProduct.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-vintage-muted leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                {/* Fabric & Fit specs */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-vintage-ivory rounded border border-vintage-border text-xs mb-6">
                  <div>
                    <span className="text-vintage-muted block">Fabric Composition:</span>
                    <strong className="text-vintage-brown">{quickViewProduct.fabric}</strong>
                  </div>
                  <div>
                    <span className="text-vintage-muted block">Tailored Fit:</span>
                    <strong className="text-vintage-brown">{quickViewProduct.fit}</strong>
                  </div>
                </div>

                {/* Color Selection */}
                {quickViewProduct.colors.length > 0 && (
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                        Color: <span className="font-normal text-vintage-muted">{selectedColor?.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {quickViewProduct.colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
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

                {/* Size Selection (Required) */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown">
                      Select Size <span className="text-vintage-burgundy">*</span>
                    </span>
                    <span className="text-[11px] text-vintage-muted">
                      {quickViewProduct.category === 'men' ? 'Standard India Sizing' : 'Age Appropriate'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className={`min-w-[44px] h-10 px-3 flex items-center justify-center text-xs font-bold tracking-wider border rounded-sm transition-all ${
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
                    <p className="mt-2 text-xs text-vintage-burgundy flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> Please select a size before adding to bag.
                    </p>
                  )}
                </div>

                {/* Quantity & Stock */}
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-vintage-brown block mb-1.5">
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
                        onClick={() => setQuantity(Math.min(quickViewProduct.stockCount ?? 15, quantity + 1))}
                        className="px-3 py-1.5 text-vintage-brown hover:text-vintage-burgundy font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-vintage-muted block mb-1">Availability:</span>
                    {quickViewProduct.inStock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-vintage-olive">
                        <Check className="w-3.5 h-3.5" /> In Stock at Palikkal Bazar ({quickViewProduct.stockCount} left)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-600">Currently Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-vintage-border">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={!quickViewProduct.inStock}
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 px-6 text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-sm ${
                      !quickViewProduct.inStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : addedSuccess
                        ? 'bg-vintage-olive text-white'
                        : 'bg-vintage-brown text-vintage-cream hover:bg-vintage-burgundy'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO BAG</span>
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
                    onClick={() => toggleWishlist(quickViewProduct)}
                    className={`p-3 border rounded-sm transition-colors ${
                      isWishlisted
                        ? 'bg-vintage-burgundy text-white border-vintage-burgundy'
                        : 'border-vintage-border hover:border-vintage-burgundy text-vintage-brown'
                    }`}
                    title={isWishlisted ? 'Saved in wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to={`/product/${quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-vintage-burgundy hover:text-vintage-brown transition-colors"
                  >
                    <span>View Complete Product Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
