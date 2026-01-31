import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How much does data recovery cost?",
    answer: "Our pricing depends on the type of failure and complexity. Logical recovery starts at ₹8,000, mechanical recovery at ₹18,000, and enterprise RAID recovery from ₹50,000. We provide free diagnostics and a fixed quote before any work begins. No recovery, no fee."
  },
  {
    question: "What's your success rate?",
    answer: "We maintain a 98% success rate across all recovery types. This high rate is due to our ISO-certified cleanroom facilities, expert engineers, and advanced forensic tools. However, success depends on the extent of physical damage to your storage device."
  },
  {
    question: "How long does recovery take?",
    answer: "Logical recovery typically takes 3-5 days, mechanical recovery 5-7 days, and complex enterprise solutions 7-10 days. We offer emergency 24-hour expedited service for critical business data. Our team works around the clock in our lab facilities."
  },
  {
    question: "Is my data secure and confidential?",
    answer: "Yes. We maintain SSAE 16 SOC Type II certification and ISO 27001 compliance. All data is recovered in isolated cleanroom facilities with biometric security. We use encrypted transfer drives and can sign confidentiality agreements for sensitive data."
  },
  {
    question: "Can you recover data from ransomware attacks?",
    answer: "Yes. While we can't decrypt ransomware-encrypted data, we can recover unencrypted backup copies, shadow volumes, and original unaffected data. Our specialists are experienced in post-ransomware recovery and forensic analysis."
  },
  {
    question: "Do you recover RAID and server data?",
    answer: "Absolutely. We specialize in enterprise RAID recovery with 6, 8, 10, and 12-bay arrays. We have expertise in various RAID levels, NAS systems (Synology, QNAP), SAN arrays, and database recovery. Enterprise support includes dedicated engineers."
  },
  {
    question: "What types of drives can you recover?",
    answer: "We recover from all drive types: HDD (mechanical hard drives), SSD (solid state drives), RAID arrays, external drives, USB flash drives, and memory cards. We also handle specialized storage like database servers and network storage systems."
  },
  {
    question: "What happens if you can't recover my data?",
    answer: "If recovery is impossible or unsuccessful, you pay nothing. This is our 'No recovery, no fee' guarantee. We diagnose the damage for free and provide a detailed report explaining the situation and any available alternatives."
  }
];

export const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Common Questions</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-secondary leading-relaxed">
            Everything you need to know about our data recovery services.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl border transition-all ${
                  activeIndex === index
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-border hover:border-accent/30'
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 transition-all"
                >
                  <h3 className="font-bold text-primary text-lg pr-4">{item.question}</h3>
                  <ChevronDown
                    className={`w-6 h-6 text-accent flex-shrink-0 transition-transform duration-300 ${
                      activeIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer */}
                {activeIndex === index && (
                  <div className="px-6 pb-6 border-t border-accent/20 pt-4 animate-fade-in">
                    <p className="text-secondary leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 p-8 glass-card rounded-3xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent-orange/10 text-center">
            <h3 className="text-2xl font-black text-primary mb-3">Still Have Questions?</h3>
            <p className="text-secondary mb-6">
              Our recovery specialists are available 24/7 to answer your specific questions and provide personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+919701087446"
                className="btn btn-primary px-8 py-3 rounded-xl font-bold hover-lift"
              >
                Call Us Now
              </a>
              <button
                onClick={() => {
                  const contact = document.getElementById('contact');
                  if (contact) {
                    contact.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="btn btn-ghost px-8 py-3 rounded-xl font-bold border-2 hover:border-accent"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
