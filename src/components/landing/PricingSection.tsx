import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap } from 'lucide-react';

interface PricingPlan {
  id: number;
  name: string;
  price_inr: number;
  price_display: string;
  features: string[];
  is_featured: boolean;
}

export const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/pricing?service=data-recovery');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || plans.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Transparent Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-4 leading-tight">
            Recovery Plans for Every Need
          </h2>
          <p className="text-xl text-secondary leading-relaxed">
            From simple data recovery to complex enterprise solutions. No hidden fees. No recovery, no charge.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                className={`relative glass-card rounded-3xl p-8 border transition-all hover:-translate-y-2 ${
                  plan.is_featured
                    ? 'border-accent lg:col-span-2 lg:row-span-2 md:col-span-2 scale-100 shadow-2xl bg-gradient-to-br from-accent/10 to-accent-orange/5'
                    : 'border-border hover:border-accent/50'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Featured Badge */}
                {plan.is_featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className={`font-black mb-3 ${plan.is_featured ? 'text-3xl' : 'text-2xl'}`}>
                    {plan.name}
                  </h3>
                  <div>
                    <div className={`font-black text-accent mb-1 ${plan.is_featured ? 'text-4xl' : 'text-3xl'}`}>
                      {plan.price_display}
                    </div>
                    <p className="text-sm text-secondary">One-time service fee</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.is_featured ? 'text-accent' : 'text-emerald-500'
                      }`} />
                      <span className="text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    const contact = document.getElementById('contact');
                    if (contact) {
                      contact.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.is_featured
                      ? 'btn btn-primary hover-lift'
                      : 'btn btn-ghost border-2 hover:border-accent hover:text-accent'
                  }`}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>

                {/* Info */}
                <p className="text-xs text-secondary text-center mt-6 pt-6 border-t border-border/50">
                  Free diagnostics included
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-16 p-8 glass-card rounded-2xl border border-border text-center">
          <h3 className="font-bold text-primary mb-4">Why Choose Our Pricing?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-black text-accent mb-2">No Recovery, No Fee</div>
              <p className="text-sm text-secondary">If we can't recover your data, you pay nothing</p>
            </div>
            <div>
              <div className="text-2xl font-black text-accent mb-2">Fixed Quotes</div>
              <p className="text-sm text-secondary">No surprises. Price fixed after free diagnosis</p>
            </div>
            <div>
              <div className="text-2xl font-black text-accent mb-2">Flexible Options</div>
              <p className="text-sm text-secondary">Partial recovery discounts available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
