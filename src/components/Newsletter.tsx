import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    // Success in demonstration mode
    setStatus('success');
    setEmail('');
    setErrorMessage('');
  };

  return (
    <section className="py-16 md:py-20 bg-vintage-burgundy text-vintage-cream border-b border-vintage-burgundy-dark relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-vintage-burgundy-dark rounded-full text-xs font-semibold tracking-wider text-vintage-gold uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN OUR INNER CIRCLE</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight mb-4">
          STAY IN STYLE
        </h2>

        <p className="text-sm md:text-base text-vintage-sand/90 max-w-xl mx-auto mb-8 font-light leading-relaxed">
          Be the first to hear about new arrivals, seasonal collections, festival releases, and special offers from our Palikkal Bazar boutique.
        </p>

        {status === 'success' ? (
          <div className="bg-vintage-burgundy-dark/90 border border-vintage-gold p-6 rounded max-w-md mx-auto space-y-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-vintage-gold mx-auto" />
            <h4 className="font-serif font-bold text-lg text-vintage-cream">Welcome to the NEW GULLY Family!</h4>
            <p className="text-xs text-vintage-sand">
              Thank you for subscribing. In this demonstration mode, your email has been verified. No spam ever.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-3 text-xs underline text-vintage-gold hover:text-white"
            >
              Subscribe another address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-vintage-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 bg-vintage-cream text-vintage-charcoal placeholder-vintage-muted text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-vintage-gold"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                className="btn-vintage-gold py-3 px-6 text-xs whitespace-nowrap shadow-md"
              >
                SUBSCRIBE
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-vintage-sand flex items-center justify-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-vintage-gold" />
                <span>{errorMessage}</span>
              </p>
            )}

            <p className="text-[11px] text-vintage-sand/70 pt-2">
              Demonstration mode preview. We respect your privacy and will never share your address.
            </p>
          </form>
        )}

      </div>
    </section>
  );
};
