import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck, Tag, ShieldCheck, Check } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../data/storeConfig';

export const Cart: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharges,
    total,
    appliedPromoCode,
    discountAmount,
    applyPromoCode,
    removePromoCode
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const navigate = useNavigate();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = await applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setPromoInput('');
  };

  const freeDeliveryThreshold = STORE_CONFIG.delivery.freeDeliveryThreshold;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (cart.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-vintage-ivory rounded-full flex items-center justify-center mx-auto mb-6 border border-vintage-border">
            <ShoppingBag className="w-10 h-10 text-vintage-gold stroke-1" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-vintage-brown mb-2">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-vintage-muted max-w-md mx-auto mb-8 leading-relaxed">
            You haven't added any clothing styles yet. Explore our curated Men's or Kids' collections to find your next favorite outfit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/mens" className="btn-vintage-primary py-3.5 px-8 text-xs w-full sm:w-auto">
              EXPLORE MEN'S COLLECTION
            </Link>
            <Link to="/kids" className="btn-vintage-secondary py-3.5 px-8 text-xs w-full sm:w-auto">
              EXPLORE KIDS' COLLECTION
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-vintage-cream min-h-screen py-10 md:py-16 border-b border-vintage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-vintage-brown mb-2">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-vintage-muted">
              Review your selected pieces, adjust quantities, or apply promotional vouchers below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free delivery bar */}
              <div className="p-4 bg-vintage-sand/30 rounded border border-vintage-border text-xs">
                {remainingForFreeDelivery === 0 ? (
                  <div className="flex items-center gap-2 text-vintage-olive-dark font-semibold">
                    <Truck className="w-4 h-4 text-vintage-olive" />
                    <span>Congratulations! You qualify for FREE Delivery across Kerala.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-vintage-brown font-medium">
                      <span>Add ₹{remainingForFreeDelivery.toLocaleString('en-IN')} more to unlock FREE Delivery</span>
                      <span className="text-[11px] text-vintage-muted">{freeDeliveryProgress}%</span>
                    </div>
                    <div className="w-full bg-vintage-border h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-vintage-gold h-full rounded-full transition-all duration-300"
                        style={{ width: `${freeDeliveryProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table / Cards */}
              <div className="bg-vintage-cream rounded border border-vintage-border overflow-hidden divide-y divide-vintage-border">
                {cart.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded border border-vintage-border shrink-0"
                      />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-vintage-gold-dark tracking-wider">
                          {item.product.category === 'men' ? "Men's" : "Kids'"} • {item.product.subCategory.replace('-', ' ')}
                        </span>
                        <h3 className="font-serif font-bold text-base text-vintage-brown">
                          <Link to={`/product/${item.product.id}`} className="hover:text-vintage-burgundy transition-colors">
                            {item.product.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-vintage-muted mt-1">
                          <span>Size: <strong className="text-vintage-brown">{item.selectedSize}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-vintage-brown">{item.selectedColor.name}</strong></span>
                        </div>
                        <div className="text-xs text-vintage-brown font-semibold mt-1">
                          ₹{item.product.price.toLocaleString('en-IN')} each
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-vintage-border/50">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-vintage-border bg-vintage-ivory rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-vintage-brown hover:text-vintage-burgundy font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-vintage-brown min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-vintage-brown hover:text-vintage-burgundy font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Total for this row */}
                      <span className="font-serif font-bold text-base text-vintage-brown min-w-[70px] text-right">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-vintage-muted hover:text-red-700 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping button */}
              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/mens"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-vintage-brown hover:text-vintage-burgundy transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>CONTINUE BROWSING MEN'S &amp; KIDS' COLLECTIONS</span>
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-red-700 hover:underline"
                >
                  Empty Bag
                </button>
              </div>

            </div>

            {/* Right Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Voucher Code Form */}
              <div className="bg-vintage-ivory/80 p-5 rounded border border-vintage-border">
                <h4 className="font-serif font-bold text-sm text-vintage-brown mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-vintage-gold" />
                  <span>Promotional Voucher</span>
                </h4>
                
                {appliedPromoCode ? (
                  <div className="flex items-center justify-between bg-vintage-cream p-2.5 rounded border border-vintage-gold text-xs">
                    <div>
                      <span className="text-[10px] text-vintage-muted uppercase block">Active Code:</span>
                      <strong className="text-vintage-olive-dark font-mono font-bold">{appliedPromoCode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-red-700 text-xs font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Enter promo code"
                        className="w-full p-2 text-xs bg-vintage-cream border border-vintage-border rounded uppercase focus:outline-none focus:ring-1 focus:ring-vintage-gold"
                      />
                      <button
                        type="submit"
                        className="btn-vintage-secondary text-xs px-4 py-2 shrink-0"
                      >
                        APPLY
                      </button>
                    </div>
                    <p className="text-[10px] text-vintage-muted">
                      Have a promo code? Enter it above — it is checked when you apply it.
                    </p>
                  </form>
                )}

                {promoMessage && (
                  <p className={`text-xs mt-2 ${promoMessage.isError ? 'text-red-600' : 'text-vintage-olive'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Order Summary Card */}
              <div className="bg-vintage-ivory/80 p-6 rounded border border-vintage-border space-y-4">
                <h3 className="font-serif font-bold text-lg text-vintage-brown pb-3 border-b border-vintage-border">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-vintage-muted">
                    <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                    <span className="font-semibold text-vintage-brown">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-vintage-olive-dark">
                      <span>Promotional Discount:</span>
                      <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-vintage-muted">
                    <span>Standard Shipping (Kerala):</span>
                    <span className="font-semibold text-vintage-brown">
                      {deliveryCharges === 0 ? (
                        <span className="text-vintage-olive font-bold">FREE</span>
                      ) : (
                        `₹${deliveryCharges}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-vintage-brown pt-3 border-t border-vintage-border">
                    <span>Order Total:</span>
                    <span className="font-serif text-xl text-vintage-burgundy">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    className="w-full btn-vintage-primary py-3.5 text-xs flex items-center justify-center gap-2"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 text-[11px] text-vintage-muted space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-vintage-gold-dark" />
                    <span>Secure checkout · Pay on delivery or at the store</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-vintage-gold-dark" />
                    <span>In-store pickup available at Palikkal Bazar</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
};
