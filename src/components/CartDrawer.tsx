import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../data/storeConfig';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    subtotal,
    deliveryCharges,
    total,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = STORE_CONFIG.delivery.freeDeliveryThreshold;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-vintage-charcoal/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-vintage-cream shadow-2xl flex flex-col border-l border-vintage-border">
          
          {/* Header */}
          <div className="p-5 border-b border-vintage-border bg-vintage-ivory flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-vintage-burgundy" />
              <h2 className="font-serif text-lg font-bold text-vintage-brown">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-vintage-muted hover:text-vintage-brown"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-5 py-3 bg-vintage-sand/40 border-b border-vintage-border text-xs">
            {remainingForFreeDelivery === 0 ? (
              <div className="flex items-center gap-2 text-vintage-olive-dark font-semibold">
                <Truck className="w-4 h-4 text-vintage-olive" />
                <span>You've unlocked FREE Delivery across Kerala!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-vintage-brown font-medium">
                  <span>Add ₹{remainingForFreeDelivery.toLocaleString('en-IN')} for Free Delivery</span>
                  <span className="text-[10px] text-vintage-muted">{freeDeliveryProgress}%</span>
                </div>
                <div className="w-full bg-vintage-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-vintage-gold h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-16 h-16 text-vintage-muted/50 stroke-1 mb-4" />
                <h3 className="font-serif font-bold text-lg text-vintage-brown mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-vintage-muted max-w-xs mb-6 leading-relaxed">
                  Explore our curated Men's and Kids' collections and discover timeless essentials for your wardrobe.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/mens');
                    }}
                    className="btn-vintage-primary text-xs py-2.5"
                  >
                    EXPLORE MEN'S COLLECTION
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/kids');
                    }}
                    className="btn-vintage-secondary text-xs py-2.5"
                  >
                    EXPLORE KIDS' COLLECTION
                  </button>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 bg-vintage-ivory/60 rounded border border-vintage-border/70"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded border border-vintage-border shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-sm text-vintage-brown line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-vintage-muted hover:text-red-700 p-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-vintage-muted mt-1">
                        <span>Size: <strong className="text-vintage-brown">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-vintage-brown">{item.selectedColor.name}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-vintage-border/50">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-vintage-border bg-vintage-cream rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-vintage-brown hover:text-vintage-burgundy font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-vintage-brown">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-vintage-brown hover:text-vintage-burgundy font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Total for item */}
                      <span className="font-serif font-bold text-sm text-vintage-brown">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-vintage-border bg-vintage-ivory/40 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-vintage-muted">
                  <span>Product Subtotal:</span>
                  <span className="font-medium text-vintage-brown">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-vintage-muted">
                  <span>Standard Delivery:</span>
                  <span className="font-medium text-vintage-brown">
                    {deliveryCharges === 0 ? (
                      <span className="text-vintage-olive font-bold">FREE</span>
                    ) : (
                      `₹${deliveryCharges}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-vintage-brown pt-2 border-t border-vintage-border">
                  <span>Estimated Total:</span>
                  <span className="font-serif text-base text-vintage-burgundy">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full btn-vintage-primary py-3 text-xs flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="flex-1 btn-vintage-secondary py-2 text-[11px]"
                  >
                    VIEW FULL BAG
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="flex-1 btn-vintage-secondary py-2 text-[11px]"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-center text-vintage-muted">
                Pay on delivery or pick up at our Palikkal Bazar store.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
