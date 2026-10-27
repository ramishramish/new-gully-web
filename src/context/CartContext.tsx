import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductColor } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';
import { api, toServerItems } from '../lib/api';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, selectedSize: string, selectedColor: ProductColor, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryCharges: number;
  total: number;
  appliedPromoCode: string | null;
  discountAmount: number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  
  // Drawer & Modals state
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;

  // Wishlist actions
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'new_gully_cart_v2';
const WISHLIST_STORAGE_KEY = 'new_gully_wishlist_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse wishlist storage:', e);
      return [];
    }
  });

  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlist]);

  const addToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: ProductColor,
    quantity = 1
  ) => {
    const itemId = `${product.id}-${selectedSize}-${selectedColor.name}`;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === itemId);
      const maxStock = product.stockCount ?? 20;

      if (existingItemIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(updated[existingItemIndex].quantity + quantity, maxStock);
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          product,
          selectedSize,
          selectedColor,
          quantity: Math.min(quantity, maxStock),
        };
        return [...prevCart, newItem];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = item.product.stockCount ?? 20;
          return {
            ...item,
            quantity: Math.min(newQuantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromoCode(null);
    setCouponDiscount(0);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // The discount is always computed by the server; the browser only displays it.
  const discountAmount = appliedPromoCode ? couponDiscount : 0;

  const deliveryCharges =
    subtotal === 0 || subtotal >= STORE_CONFIG.delivery.freeDeliveryThreshold
      ? 0
      : STORE_CONFIG.delivery.standardDeliveryCharge;

  const total = Math.max(0, subtotal - discountAmount + deliveryCharges);

  const checkCoupon = async (code: string) =>
    api<{ couponApplied: string | null; discount: number; couponMessage: string | null }>('POST', '/api/public/cart/price', { items: toServerItems(cart), couponCode: code });

  const applyPromoCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cart.length === 0) return { success: false, message: 'Add items to your cart first.' };
    try {
      const r = await checkCoupon(cleanCode);
      if (!r.couponApplied) return { success: false, message: r.couponMessage || 'Invalid or expired promotional code.' };
      setAppliedPromoCode(r.couponApplied);
      setCouponDiscount(r.discount);
      return { success: true, message: `${r.couponApplied} applied! You save ₹${r.discount.toLocaleString('en-IN')}.` };
    } catch {
      return { success: false, message: 'Could not verify the code right now. Please try again.' };
    }
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setCouponDiscount(0);
  };

  // Re-verify the coupon whenever the cart changes (quantities, minimum order, eligible items…)
  useEffect(() => {
    if (!appliedPromoCode) return;
    if (cart.length === 0) { setAppliedPromoCode(null); setCouponDiscount(0); return; }
    let cancelled = false;
    checkCoupon(appliedPromoCode).then((r) => {
      if (cancelled) return;
      if (r.couponApplied) setCouponDiscount(r.discount); else { setAppliedPromoCode(null); setCouponDiscount(0); }
    }).catch(() => { /* keep last known value; the server re-validates at checkout anyway */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, appliedPromoCode]);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryCharges,
        total,
        appliedPromoCode,
        discountAmount,
        applyPromoCode,
        removePromoCode,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        isSearchOpen,
        setIsSearchOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
