import React from 'react';
import { ContactForm } from '../components/ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const ContactPage: React.FC = () => {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 md:py-24">
                <div className="absolute inset-0 hero-gradient opacity-20"></div>
                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-primary">
                            Contact Us
                        </h1>
                        <p className="text-lg md:text-xl text-secondary leading-relaxed">
                            Have a question or want to work together? We'd love to hear from you.
                            Fill out the form below and we'll get back to you as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 md:py-16">
                <div className="container">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-primary mb-6">Contact Information</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Email</h4>
                                            <a href="mailto:info@swazsolutions.com" className="text-secondary hover:text-accent transition-colors">
                                                info@swazsolutions.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Phone</h4>
                                            <a href="tel:+919701087446" className="text-secondary hover:text-accent transition-colors">
                                                +91-9701087446
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Location</h4>
                                            <p className="text-secondary">
                                                Hyderabad, India
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary">Business Hours</h4>
                                            <p className="text-secondary">
                                                Mon - Fri: 9:00 AM - 6:00 PM IST
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-xl font-bold text-primary mb-4">Quick Links</h3>
                                <ul className="space-y-2 text-secondary">
                                    <li>
                                        <a href="#/agentic-ai" className="hover:text-accent transition-colors">
                                            Agentic AI Solutions
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#/about" className="hover:text-accent transition-colors">
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#/help" className="hover:text-accent transition-colors">
                                            Help Center
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
