import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    // Honeypot check - if filled, silently succeed but don't actually submit
    if (honeypot) {
      setSubmitted(true);
      setEmail('');
      setName('');
      setTimeout(() => setSubmitted(false), 5000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, honeypot })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error.includes('already subscribed')) {
          showToast('You are already subscribed!', 'warning');
        } else {
          showToast(data.error || 'Subscription failed', 'error');
        }
        return;
      }

      setSubmitted(true);
      setEmail('');
      setName('');
      showToast('Successfully subscribed to newsletter!', 'success');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Subscription error:', error);
      showToast('Subscription failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-accent/10 via-background to-accent-orange/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-orange/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 md:p-12 rounded-3xl border border-accent/30 shadow-2xl">
            {!submitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="p-3 w-fit mx-auto rounded-xl bg-accent/10 mb-4">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-primary mb-3">
                    Stay Updated
                  </h2>
                  <p className="text-secondary max-w-xl mx-auto">
                    Get expert tips on data protection, recovery stories, and exclusive recovery service discounts delivered to your inbox monthly.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input - Optional */}
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />

                  {/* Email Input */}
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-primary placeholder-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />

                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="website_url"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                  />

                  {/* Subscribe Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover-lift disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Subscribing...' : 'Subscribe Now'}
                  </button>

                  {/* Privacy Notice */}
                  <p className="text-xs text-secondary/70 text-center mt-4">
                    We respect your privacy. Unsubscribe anytime. No spam, ever.
                  </p>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center py-8">
                  <div className="p-4 w-fit mx-auto rounded-full bg-emerald-500/10 mb-4">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-2">
                    Welcome to Our Community!
                  </h3>
                  <p className="text-secondary max-w-md mx-auto">
                    Check your email for a confirmation. We'll send monthly tips, recovery insights, and exclusive offers.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <div className="font-bold text-primary mb-1">Secure</div>
              <p className="text-xs text-secondary">SSL Encrypted</p>
            </div>
            <div>
              <div className="font-bold text-primary mb-1">Privacy</div>
              <p className="text-xs text-secondary">GDPR Compliant</p>
            </div>
            <div>
              <div className="font-bold text-primary mb-1">Spam-Free</div>
              <p className="text-xs text-secondary">No Spam Ever</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
