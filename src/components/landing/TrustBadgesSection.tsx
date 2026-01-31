import React from 'react';
import { Shield, Lock, Award, Zap, Users, CheckCircle, Clock, Globe } from 'lucide-react';

interface Badge {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const badges: Badge[] = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: "SSAE 16 Certified",
    description: "SOC Type II audit-compliant data center with rigorous security protocols"
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "ISO 27001 Certified",
    description: "Enterprise-grade information security management standards"
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Industry Leading",
    description: "98% success rate across all recovery types and failure scenarios"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "24/7 Emergency Lab",
    description: "Round-the-clock operations for critical business data recovery"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "40+ Experts",
    description: "Certified engineers with 10+ years specialization in data recovery"
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: "No Recovery, No Fee",
    description: "Transparent pricing with fixed quotes and risk-free guarantee"
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Fast Turnaround",
    description: "3-7 day recovery with emergency expedited 24-hour options"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Standard",
    description: "Meets international data protection and confidentiality regulations"
  }
];

export const TrustBadgesSection: React.FC = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <Award className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Why Trust Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-3 leading-tight">
            Enterprise Security & Certifications
          </h2>
          <p className="text-secondary">
            Trusted by businesses worldwide with industry-leading security standards
          </p>
        </div>

        {/* Badges Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-border hover:border-accent/50 hover:-translate-y-1 transition-all group"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Icon */}
                <div className="p-3 w-fit rounded-xl bg-accent/10 group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all mb-4">
                  <div className="text-accent group-hover:text-white">{badge.icon}</div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-primary mb-2 text-sm">{badge.title}</h3>
                <p className="text-xs text-secondary leading-relaxed">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="glass-card p-6 rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent mb-2">12+</div>
              <p className="text-xs text-secondary font-bold uppercase">Years in Business</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent mb-2">10K+</div>
              <p className="text-xs text-secondary font-bold uppercase">Cases Resolved</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent mb-2">98%</div>
              <p className="text-xs text-secondary font-bold uppercase">Success Rate</p>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent mb-2">4.9/5</div>
              <p className="text-xs text-secondary font-bold uppercase">Client Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
