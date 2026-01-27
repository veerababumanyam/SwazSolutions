/**
 * AI-Optimized Content Routes
 * Provides structured JSON responses optimized for AI search engines
 * These endpoints serve machine-readable content for AI crawlers
 */

const express = require('express');
const router = express.Router();

/**
 * Complete Guide to Data Recovery - HowTo Schema
 * Optimized for AI extraction and step-by-step understanding
 */
router.get('/data-recovery-guide', (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Complete Guide to Professional Data Recovery',
    description: 'Step-by-step guide to professional data recovery services for hard drives, SSDs, RAID arrays, and flash media',
    totalTime: 'PT3D',  // 3 days average
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      minValue: '5000',
      maxValue: '75000'
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Class 100 Cleanroom'
      },
      {
        '@type': 'HowToTool',
        name: 'Professional Recovery Software'
      },
      {
        '@type': 'HowToTool',
        name: 'Specialized Hardware Tools'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Diagnose the Failure',
        text: 'Professional diagnostic evaluation identifies failure type (mechanical, logical, or physical) and assesses recovery difficulty. Free diagnostic takes 4-6 hours.',
        url: 'https://swazdatarecovery.com/services/data-recovery#diagnostic'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Receive Recovery Quote',
        text: 'Get fixed-price quote with file list preview showing recoverable data. No hidden fees. Decide whether to proceed based on value of data.',
        url: 'https://swazdatarecovery.com/services/data-recovery#pricing'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Data Recovery Process',
        text: 'Mechanical failures: Cleanroom head swaps. Logical corruption: Sector-by-sector imaging and file reconstruction. RAID arrays: Virtual destriping and array reconstruction.',
        url: 'https://swazdatarecovery.com/services/data-recovery#process'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Quality Verification',
        text: 'Verify file integrity, check for corruption, validate critical files. Ensure all recoverable data has been extracted successfully.',
        url: 'https://swazdatarecovery.com/services/data-recovery#quality'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Secure Data Return',
        text: 'Recovered data returned on new storage device with encryption. Original device returned or securely destroyed per your request.',
        url: 'https://swazdatarecovery.com/services/data-recovery#delivery'
      }
    ]
  });
});

/**
 * Data Recovery Services Overview
 * Structured service catalog for AI understanding
 */
router.get('/services-catalog', (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Swaz Solutions Data Recovery Services',
    description: 'Complete catalog of professional data recovery services available across India',
    itemListElement: [
      {
        '@type': 'Service',
        position: 1,
        name: 'Hard Drive Data Recovery',
        description: 'Mechanical and logical hard drive recovery with cleanroom head swaps. Recovers from clicking drives, head crashes, motor failures, and firmware corruption.',
        url: 'https://swazdatarecovery.com/services/hard-drive-recovery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          priceRange: '₹15,000-₹35,000'
        }
      },
      {
        '@type': 'Service',
        position: 2,
        name: 'SSD Data Recovery',
        description: 'NAND flash recovery for solid state drives. Handles controller failures, firmware corruption, and wear leveling issues.',
        url: 'https://swazdatarecovery.com/services/ssd-recovery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          priceRange: '₹18,000-₹45,000'
        }
      },
      {
        '@type': 'Service',
        position: 3,
        name: 'RAID Array Recovery',
        description: 'Enterprise RAID recovery for RAID 0, 1, 5, 6, 10. Virtual destriping, multiple drive failures, NAS/SAN recovery.',
        url: 'https://swazdatarecovery.com/services/raid-recovery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          priceRange: '₹40,000-₹75,000'
        }
      },
      {
        '@type': 'Service',
        position: 4,
        name: 'Ransomware Recovery',
        description: 'Encrypted file recovery and ransomware removal. Backup restoration, decryption tools, shadow copy recovery. 24/7 emergency service.',
        url: 'https://swazdatarecovery.com/services/ransomware-recovery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          priceRange: '₹10,000-₹50,000'
        }
      },
      {
        '@type': 'Service',
        position: 5,
        name: 'Emergency 24/7 Recovery',
        description: 'Critical business data recovery with expedited 24-48 hour turnaround. Available anytime for urgent situations.',
        url: 'https://swazdatarecovery.com/services/data-recovery',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock'
        }
      }
    ]
  });
});

/**
 * Company Information for AI Understanding
 */
router.get('/company-info', (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://swazdatarecovery.com/#organization',
    name: 'Swaz Solutions',
    description: 'Professional data recovery services across India with 98% success rate. Specializing in hard drive, SSD, RAID array, and ransomware recovery.',
    telephone: '+91-9701087446',
    email: 'support@swazsolutions.com',
    url: 'https://swazdatarecovery.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Hyderabad',
      addressRegion: 'Telangana',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '17.3850',
      longitude: '78.4867'
    },
    areaServed: {
      '@type': 'Country',
      name: 'India'
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59'
    },
    priceRange: '₹₹-₹₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, UPI, Bank Transfer',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Data Recovery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Diagnostic Evaluation',
            description: '4-6 hour comprehensive diagnostic with file list preview and fixed-price quote'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'No Data, No Fee Guarantee',
            description: 'Only pay if we successfully recover your data'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '24/7 Emergency Service',
            description: 'Critical business data recovery available anytime'
          }
        }
      ]
    }
  });
});

/**
 * Common Data Recovery Questions - AI-Optimized FAQ
 */
router.get('/faq', (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does data recovery cost in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Data recovery in India costs ₹5,000-₹75,000 depending on failure type. Logical recovery starts at ₹8,000, mechanical HDD recovery ₹15,000-₹35,000, RAID recovery ₹40,000-₹75,000. Free diagnostics provided within 4-6 hours. No data, no fee guarantee.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the success rate for data recovery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Swaz Solutions maintains a 98% success rate across all device types and failure scenarios including mechanical failures, RAID arrays, SSDs, and logical corruption. Success based on thousands of recoveries.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does data recovery take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Standard recovery: 3-7 business days. Simple logical recovery: 24-48 hours. Complex RAID recovery: 7-14 days. Emergency service: 24-48 hours. Free diagnostic: 4-6 hours.'
        }
      }
    ]
  });
});

module.exports = router;
