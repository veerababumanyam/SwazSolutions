import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * DataRecoveryBanner Component
 * 
 * A small, non-intrusive banner displayed only on Music, Lyric Studio, and Camera Updates pages
 * to promote data recovery services without disrupting the main landing page.
 * 
 * Features:
 * - Only shows on /music, /studio, and /camera-updates routes
 * - Smooth slide-down animation on mount
 * - Dismissible with localStorage persistence (7 days)
 * - Compact responsive design
 * - Accessible (ARIA labels, keyboard navigation)
 * - Links to contact section on landing page
 * 
 * Z-Index: 60 (above Header at 50, below Toast at 100)
 */
export default function DataRecoveryBanner() {
  const location = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Only show on specific pages
  const allowedPaths = ['/music', '/studio', '/camera-updates'];
  const shouldShow = allowedPaths.includes(location.pathname);

  // Configuration
  const DISMISSAL_DURATION_DAYS = 7;
  const STORAGE_KEY = 'data-recovery-banner-dismissed';

  useEffect(() => {
    // Only process if we're on an allowed page
    if (!shouldShow) {
      setIsDismissed(true);
      return;
    }

    // Check localStorage for dismissal
    const dismissedTimestamp = localStorage.getItem(STORAGE_KEY);
    const dismissalDuration = DISMISSAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
    const expiryTime = Date.now() - dismissalDuration;

    if (dismissedTimestamp && parseInt(dismissedTimestamp) > expiryTime) {
      setIsDismissed(true);
    } else {
      // Show banner after brief delay for smooth entry
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [shouldShow]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }, 300); // Match CSS animation duration
  };

  // Early return if dismissed
  if (isDismissed) return null;

  return (
    <div
      className={`data-recovery-banner ${isVisible ? 'visible' : 'hidden'}`}
      role="banner"
      aria-label="Data recovery services promotion"
    >
      <div className="banner-container">
        
        {/* Left: Icon + Message */}
        <div className="banner-content">
          <Shield className="banner-icon" aria-hidden="true" />
          <p className="banner-message">
            <span className="banner-message-desktop">Need Data Recovery? 24/7 Service Available</span>
            <span className="banner-message-mobile">Data Recovery 24/7</span>
          </p>
        </div>

        {/* Right: CTA + Dismiss */}
        <div className="banner-actions">
          <Link
            to="/#contact"
            className="banner-cta-btn"
            aria-label="Get free data recovery evaluation"
            onClick={() => {
              // Smooth scroll to contact section if already on homepage
              if (window.location.hash === '#/') {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }}
          >
            <span className="banner-cta-full">Free Eval</span>
            <span className="banner-cta-short">Contact</span>
          </Link>
          
          <button
            onClick={handleDismiss}
            className="banner-close-btn"
            aria-label="Dismiss banner"
          >
            <X className="banner-close-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
