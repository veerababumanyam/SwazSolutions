import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface Testimonial {
  id: number;
  author_name: string;
  author_role: string;
  author_company: string;
  rating: number;
  content: string;
  verified: boolean;
  featured: boolean;
}

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials?service=data-recovery&limit=6');
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, testimonials.length - 2)) % Math.max(1, testimonials.length - 2));
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Trusted by Thousands</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-4 leading-tight">
            What Our Clients Say
          </h2>
          <p className="text-xl text-secondary leading-relaxed">
            Real experiences from businesses and individuals we've helped recover their critical data.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
              {testimonials.slice(currentIndex, currentIndex + 3).map((testimonial, idx) => (
                <div
                  key={testimonial.id}
                  className="glass-card p-8 rounded-2xl border border-border hover:-translate-y-2 transition-all animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-secondary leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-orange flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.author_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-primary">{testimonial.author_name}</h4>
                          {testimonial.verified && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" title="Verified customer" />
                          )}
                        </div>
                        <p className="text-sm text-secondary">{testimonial.author_role}</p>
                        <p className="text-xs text-secondary/70">{testimonial.author_company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {testimonials.length > 3 && (
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={prevSlide}
                  className="p-3 rounded-full bg-surface border-2 border-border text-primary hover:border-accent hover:text-accent transition-all"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-3 rounded-full bg-surface border-2 border-border text-primary hover:border-accent hover:text-accent transition-all"
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16">
            <div className="text-center p-6 glass-card rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent">10K+</div>
              <div className="text-xs uppercase text-secondary font-bold mt-2">Happy Customers</div>
            </div>
            <div className="text-center p-6 glass-card rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent">98%</div>
              <div className="text-xs uppercase text-secondary font-bold mt-2">Success Rate</div>
            </div>
            <div className="text-center p-6 glass-card rounded-2xl border border-border">
              <div className="text-3xl font-black text-accent">4.9/5</div>
              <div className="text-xs uppercase text-secondary font-bold mt-2">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
