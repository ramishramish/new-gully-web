import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { STORE_CONFIG, getWhatsAppEnquiryUrl } from '../data/storeConfig';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Please enter a valid phone number.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!formData.message.trim()) newErrors.message = 'Message content cannot be blank.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Demonstration submission state
    setIsSubmitted(true);
  };

  const whatsAppUrl = getWhatsAppEnquiryUrl();

  return (
    <PageTransition>
      {/* Banner */}
      <div className="bg-vintage-brown text-vintage-cream py-14 md:py-20 border-b border-vintage-gold/50 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-vintage-gold block mb-2">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold tracking-tight mb-4 text-vintage-cream">
            CONTACT &amp; STORE
          </h1>
          <p className="text-sm sm:text-base text-vintage-sand max-w-xl mx-auto font-light leading-relaxed">
            Have questions about sizes, bulk festive orders, or directions to our Palikkal Bazar boutique? 
            Our store team is happy to assist you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-vintage-cream p-8 md:p-10 rounded border border-vintage-border shadow-vintage">
            <h2 className="font-serif font-bold text-2xl text-vintage-brown mb-1">
              Send an Inquiry
            </h2>
            <p className="text-xs text-vintage-muted mb-6">
              Fill in your details below and our team will get back to you promptly.
            </p>

            {isSubmitted ? (
              <div className="bg-vintage-ivory border border-vintage-gold p-8 rounded text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-vintage-gold mx-auto" />
                <h3 className="font-serif font-bold text-2xl text-vintage-brown">
                  Thank You, {formData.name}!
                </h3>
                <p className="text-xs text-vintage-muted max-w-md mx-auto leading-relaxed">
                  Your message has been received in demonstration mode. In a live environment with an active backend, 
                  our Palikkal Bazar staff receives an instant notification to follow up on your query.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
                    }}
                    className="btn-vintage-secondary text-xs py-2 px-6"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Full Name <span className="text-vintage-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Muhammed Nihal"
                      className={`w-full p-3 text-xs bg-vintage-ivory border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.name ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Mobile Number <span className="text-vintage-burgundy">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="e.g. +91 98460 12345"
                      className={`w-full p-3 text-xs bg-vintage-ivory border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.mobile ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.mobile}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Email Address <span className="text-vintage-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. nihal@example.com"
                      className={`w-full p-3 text-xs bg-vintage-ivory border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.email ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-vintage-brown mb-1">
                      Subject <span className="text-vintage-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Wedding Suit Fitting / Size Query"
                      className={`w-full p-3 text-xs bg-vintage-ivory border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                        errors.subject ? 'border-red-500' : 'border-vintage-border'
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-vintage-brown mb-1">
                    Your Message <span className="text-vintage-burgundy">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you're looking for, or any questions regarding our menswear and kids collections..."
                    className={`w-full p-3 text-xs bg-vintage-ivory border rounded text-vintage-brown focus:outline-none focus:ring-1 focus:ring-vintage-gold ${
                      errors.message ? 'border-red-500' : 'border-vintage-border'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-vintage-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>SEND INQUIRY (DEMO MODE)</span>
                  </button>
                  <p className="text-[10px] text-center text-vintage-muted mt-2">
                    Note: This form runs in demonstration mode until an email backend is connected.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Boutique Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-vintage-ivory/60 p-6 rounded border border-vintage-border shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-vintage-brown pb-2 border-b border-vintage-border">
                Store Details
              </h3>

              <div className="flex items-start space-x-3 text-xs">
                <MapPin className="w-4 h-4 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="text-vintage-brown block">{STORE_CONFIG.name}</strong>
                  <p className="text-vintage-muted">{STORE_CONFIG.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <Clock className="w-4 h-4 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="text-vintage-brown block">Opening Hours:</strong>
                  <p className="text-vintage-muted">Weekdays: {STORE_CONFIG.businessHours.weekdays}</p>
                  <p className="text-vintage-muted">Weekends: {STORE_CONFIG.businessHours.weekends}</p>
                  <p className="text-vintage-olive font-medium mt-0.5">{STORE_CONFIG.businessHours.note}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <Phone className="w-4 h-4 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="text-vintage-brown block">Phone Assistance:</strong>
                  <p className="text-vintage-muted">{STORE_CONFIG.phoneDisplay}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <Mail className="w-4 h-4 text-vintage-gold-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="text-vintage-brown block">Email:</strong>
                  <p className="text-vintage-muted">{STORE_CONFIG.email}</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={STORE_CONFIG.maps.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vintage-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  <span>GET DIRECTIONS ON GOOGLE MAPS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="p-6 bg-vintage-brown text-vintage-cream rounded border border-vintage-gold/50 shadow-vintage space-y-3">
              <div className="flex items-center gap-2 text-vintage-gold text-xs font-bold uppercase tracking-wider">
                <MessageCircle className="w-4 h-4" />
                <span>Instant WhatsApp Enquiries</span>
              </div>
              <p className="text-xs text-vintage-sand/90 leading-relaxed font-light">
                Shop owners can configure their real WhatsApp digits in <code className="text-vintage-gold font-mono">storeConfig.ts</code> to enable 1-click mobile chats.
              </p>
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vintage-gold w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHAT ON WHATSAPP</span>
                </a>
              ) : (
                <div className="p-2.5 bg-vintage-brown-dark rounded border border-vintage-border-dark text-[11px] text-vintage-sand/80 text-center">
                  WhatsApp link ready for live number configuration
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Embedded Map Section */}
        <div className="rounded border border-vintage-border overflow-hidden shadow-vintage h-80 sm:h-96">
          <iframe
            title="NEW GULLY Store Location Palikkal Bazar"
            src={STORE_CONFIG.maps.embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>

      </div>
    </PageTransition>
  );
};
