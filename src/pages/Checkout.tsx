import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, ArrowLeft, Truck, Package, Printer, Sparkles, MapPin, Phone, Info } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { useCart } from '../context/CartContext';
import { STORE_CONFIG } from '../data/storeConfig';
import { DemonstrationOrder, OrderCustomerDetails } from '../types';
import { api, toServerItems } from '../lib/api';

export const Checkout: React.FC = () => {
  const { cart, subtotal, deliveryCharges, discountAmount, total, appliedPromoCode, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<OrderCustomerDetails>({
    fullName: '',
    mobile: '',
    email: '',
    address: '',
    landmark: '',
    city: 'Malappuram',
    state: 'Kerala',
    pinCode: '',
    notes: '',
  });

  const [paymentOption, setPaymentOption] = useState<'cod' | 'store-pickup'>('cod');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<DemonstrationOrder | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.mobile.trim()) {
      errs.mobile = 'Mobile number is required for delivery coordination.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(form.mobile.trim())) {
      errs.mobile = 'Please provide a valid contact number.';
    }
    if (!form.address.trim()) errs.address = 'Street address / House name is required.';
    if (!form.city.trim()) errs.city = 'Town / City is required.';
    if (!form.pinCode.trim()) {
      errs.pinCode = 'Postal PIN code is required.';
    } else if (!/^\d{6}$/.test(form.pinCode.trim())) {
      errs.pinCode = 'Enter a valid 6-digit Indian PIN code.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    let result: { number: string; subtotal: number; discount: number; delivery: number; total: number };
    try {
      // Only ids, sizes, colours and quantities are sent — the server looks up every price itself.
      result = await api('POST', '/api/public/orders', {
        customer: form, items: toServerItems(cart), couponCode: appliedPromoCode, paymentMethod: paymentOption,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not place the order. Please try again.');
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const demoOrder: DemonstrationOrder = {
      orderId: result.number,
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customer: { ...form },
      items: [...cart],
      subtotal: result.subtotal,
      deliveryCharges: result.delivery,
      discountAmount: result.discount,
      total: result.total,
      status: 'Confirmed',
      isDemo: false,
    };

    setConfirmedOrder(demoOrder);
    setSubmitting(false);
    clearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C49C4C', '#731C28', '#281A14', '#4D5D46'],
      });
    } catch (e) {
      // safe fallback if canvas confetti not supported
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If order confirmed, render confirmation receipt
  if (confirmedOrder) {
    return (
      <PageTransition>
        <div className="bg-vintage-cream min-h-screen py-12 md:py-20 border-b border-vintage-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="bg-white p-8 md:p-12 rounded border-2 border-vintage-gold shadow-vintage-lg relative print:shadow-none">
              
              {/* Decorative Stamp */}
              <div className="absolute top-8 right-8 hidden sm:block border-2 border-vintage-burgundy rounded px-3 py-1 text-center transform rotate-6">
                <span className="text-[10px] uppercase font-bold text-vintage-burgundy block">NEW GULLY</span>
                <span className="font-serif font-bold text-xs text-vintage-burgundy">ORDER RECEIVED</span>
              </div>

              <div className="text-center mb-8 pb-6 border-b border-vintage-border">
                <CheckCircle2 className="w-16 h-16 text-vintage-olive mx-auto mb-3" />
                <span className="text-xs uppercase tracking-widest text-vintage-gold-dark font-bold block mb-1">
                  ORDER RECEIVED
                </span>
                <h1 className="font-serif font-bold text-3xl text-vintage-brown mb-2">
                  Thank You, {confirmedOrder.customer.fullName}!
                </h1>
                <p className="text-xs text-vintage-muted max-w-md mx-auto">
                  We have received your order. Our team will contact you to confirm it. Your order number:
                </p>
                <div className="mt-2 inline-block bg-vintage-ivory px-4 py-2 rounded border border-vintage-border">
                  <span className="font-mono font-bold text-lg text-vintage-brown tracking-wider">
                    {confirmedOrder.orderId}
                  </span>
                </div>
              </div>

              {/* Order Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-vintage-muted mb-8 p-4 bg-vintage-ivory/50 rounded border border-vintage-border">
                <div>
                  <strong className="text-vintage-brown block mb-1">Delivery Address:</strong>
                  <p>{confirmedOrder.customer.fullName}</p>
                  <p>{confirmedOrder.customer.address}</p>
                  {confirmedOrder.customer.landmark && <p>Landmark: {confirmedOrder.customer.landmark}</p>}
                  <p>{confirmedOrder.customer.city}, {confirmedOrder.customer.state} - {confirmedOrder.customer.pinCode}</p>
                  <p className="mt-1">Phone: {confirmedOrder.customer.mobile}</p>
                </div>
                <div>
                  <strong className="text-vintage-brown block mb-1">Order Details:</strong>
                  <p>Date: {confirmedOrder.createdAt}</p>
                  <p>Store: {STORE_CONFIG.name}, {STORE_CONFIG.area}</p>
                  <p>Payment: Cash on Delivery / In-Store (pay when you receive)</p>
                  <p className="mt-1 text-vintage-olive font-semibold">Status: Received — awaiting confirmation</p>
                </div>
              </div>

              {/* Itemized List */}
              <div className="mb-8">
                <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-vintage-brown mb-3">
                  Purchased Items ({confirmedOrder.items.length})
                </h3>
                <div className="divide-y divide-vintage-border border-y border-vintage-border text-xs">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center">
                      <div>
                        <strong className="text-vintage-brown block text-sm">{item.product.name}</strong>
                        <span className="text-vintage-muted">
                          Size: {item.selectedSize} • Color: {item.selectedColor.name} • Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-vintage-brown text-sm">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Recap */}
              <div className="space-y-2 text-xs border-b border-vintage-border pb-6 mb-8">
                <div className="flex justify-between text-vintage-muted">
                  <span>Subtotal:</span>
                  <span className="font-medium text-vintage-brown">₹{confirmedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {confirmedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-vintage-olive">
                    <span>Discount Applied:</span>
                    <span>-₹{confirmedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-vintage-muted">
                  <span>Delivery Charges:</span>
                  <span className="font-medium text-vintage-brown">
                    {confirmedOrder.deliveryCharges === 0 ? 'FREE' : `₹${confirmedOrder.deliveryCharges}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-vintage-brown pt-2 border-t border-vintage-border">
                  <span>Grand Total (INR):</span>
                  <span className="font-serif text-xl text-vintage-burgundy">
                    ₹{confirmedOrder.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 btn-vintage-secondary py-3 text-xs flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT ORDER SUMMARY</span>
                </button>
                <Link
                  to="/"
                  className="flex-1 btn-vintage-primary py-3 text-xs flex items-center justify-center gap-2"
                >
                  <span>RETURN TO HOMEPAGE</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </PageTransition>
    );
  }

  // If cart empty, redirect
  if (cart.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Package className="w-16 h-16 text-vintage-muted mx-auto mb-4 stroke-1" />
          <h2 className="font-serif font-bold text-2xl text-vintage-brown mb-2">No Items to Checkout</h2>
          <p className="text-xs text-vintage-muted mb-6">Your shopping bag is currently empty.</p>
          <Link to="/mens" className="btn-vintage-primary py-3 px-6 text-xs">
            BROWSE MENSWEAR
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-vintage-cream min-h-screen py-10 md:py-16 border-b border-vintage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-vintage-muted hover:text-vintage-brown mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Shopping Bag
            </Link>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-vintage-brown">
              Checkout
            </h1>
            <p className="text-xs text-vintage-muted">
              Complete your simulated order. No actual financial transaction will take place.
            </p>
          </div>

          {submitError && (
            <div role="alert" className="mb-6 border border-vintage-burgundy bg-vintage-burgundy/10 text-vintage-burgundy-dark text-sm px-4 py-3 rounded">
              {submitError}
            </div>
          )}
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Customer Form (7 cols) */}
              <div className="lg:col-span-7 bg-vintage-ivory/60 p-6 md:p-8 rounded border border-vintage-border space-y-6">
                
                <div className="flex items-center gap-2 pb-3 border-b border-vintage-border">
                  <MapPin className="w-5 h-5 text-vintage-gold-dark" />
                  <h2 className="font-serif font-bold text-lg text-vintage-brown">
                    1. Delivery Address (Kerala &amp; India)
                  </h2>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Customer Full Name <span className="text-vintage-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Muhammed Nihal"
                      className={`w-full p-3 bg-vintage-cream border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.fullName ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                        Mobile Number <span className="text-vintage-burgundy">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="+91 98460 12345"
                        className={`w-full p-3 bg-vintage-cream border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                          errors.mobile ? 'border-red-500' : 'border-vintage-border'
                        }`}
                      />
                      {errors.mobile && <p className="text-red-600 mt-1">{errors.mobile}</p>}
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                        Email Address <span className="text-vintage-muted font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="care@example.com"
                        className="w-full p-3 bg-vintage-cream border border-vintage-border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      House / Flat / Street Address <span className="text-vintage-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="e.g. Rose Villa, Main Road, Palikkal"
                      className={`w-full p-3 bg-vintage-cream border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.address ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.address && <p className="text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  {/* Landmark, City, State, PIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                        Town / City <span className="text-vintage-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Malappuram"
                        className="w-full p-3 bg-vintage-cream border border-vintage-border rounded text-vintage-brown"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        readOnly
                        className="w-full p-3 bg-vintage-sand/50 border border-vintage-border rounded text-vintage-brown cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                        PIN Code <span className="text-vintage-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={form.pinCode}
                        onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                        placeholder="673634"
                        className={`w-full p-3 bg-vintage-cream border rounded text-vintage-brown ${
                          errors.pinCode ? 'border-red-500' : 'border-vintage-border'
                        }`}
                      />
                      {errors.pinCode && <p className="text-red-600 mt-1">{errors.pinCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Delivery Notes / Landmark
                    </label>
                    <input
                      type="text"
                      value={form.landmark}
                      onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                      placeholder="e.g. Near Palikkal Bazar Juma Masjid"
                      className="w-full p-3 bg-vintage-cream border border-vintage-border rounded text-vintage-brown"
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div className="pt-4 border-t border-vintage-border">
                  <h3 className="font-serif font-bold text-base text-vintage-brown mb-3">
                    2. Payment Method
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 bg-vintage-cream border border-vintage-border rounded cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'cod'}
                        onChange={() => setPaymentOption('cod')}
                        className="accent-vintage-burgundy"
                      />
                      <div className="text-xs">
                        <strong className="text-vintage-brown block">Cash on Delivery (COD) / Pay on Arrival</strong>
                        <span className="text-vintage-muted">Pay in cash when your parcel arrives, or at the store.</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 bg-vintage-cream border border-vintage-border rounded cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'store-pickup'}
                        onChange={() => setPaymentOption('store-pickup')}
                        className="accent-vintage-burgundy"
                      />
                      <div className="text-xs">
                        <strong className="text-vintage-brown block">Pay &amp; Pickup In-Store at Palikkal Bazar</strong>
                        <span className="text-vintage-muted">Visit our showroom to inspect and collect with zero shipping charge.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 bg-vintage-ivory/80 p-6 rounded border border-vintage-border space-y-6">
                <h3 className="font-serif font-bold text-lg text-vintage-brown pb-3 border-b border-vintage-border">
                  Order Summary ({cart.length} styles)
                </h3>

                <div className="divide-y divide-vintage-border/70 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-12 object-cover rounded border border-vintage-border"
                        />
                        <div>
                          <p className="font-semibold text-vintage-brown truncate max-w-[170px]">
                            {item.product.name}
                          </p>
                          <p className="text-vintage-muted text-[10px]">
                            {item.selectedSize} • Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-vintage-brown">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-vintage-border space-y-2 text-xs">
                  <div className="flex justify-between text-vintage-muted">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-vintage-brown">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-vintage-olive">
                      <span>Voucher Discount ({appliedPromoCode}):</span>
                      <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-vintage-muted">
                    <span>Shipping Charges:</span>
                    <span className="font-semibold text-vintage-brown">
                      {paymentOption === 'store-pickup' || deliveryCharges === 0 ? (
                        <span className="text-vintage-olive font-bold">FREE</span>
                      ) : (
                        `₹${deliveryCharges}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-vintage-brown pt-3 border-t border-vintage-border">
                    <span>Total Amount (INR):</span>
                    <span className="font-serif text-xl text-vintage-burgundy">
                      ₹{(paymentOption === 'store-pickup' ? Math.max(0, subtotal - discountAmount) : total).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-vintage-primary py-4 text-xs font-bold tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{submitting ? 'PLACING ORDER…' : 'PLACE ORDER'}</span>
                  </button>
                </div>

                <div className="p-3 bg-vintage-sand/40 rounded border border-vintage-border text-[11px] text-vintage-muted space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-vintage-brown">
                    <Info className="w-3.5 h-3.5 text-vintage-gold-dark" />
                    <span>Pay on delivery / at store</span>
                  </div>
                  <p>
                    No online payment is taken. We confirm your order with you before dispatch.
                  </p>
                </div>

              </div>

            </div>
          </form>

        </div>
      </div>
    </PageTransition>
  );
};
