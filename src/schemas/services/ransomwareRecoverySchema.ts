/**
 * Service Schema for Ransomware Data Recovery
 * Provides structured data for search engines about ransomware recovery services
 */

export const ransomwareRecoverySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://swazdatarecovery.com/services/ransomware-recovery#service',
  serviceType: 'Ransomware Data Recovery',
  name: 'Ransomware Recovery and Decryption Services India',
  description: 'Professional ransomware data recovery and encrypted file restoration. Backup recovery, decryption tools, and shadow copy restoration. Emergency 24/7 service for business-critical situations.',
  provider: {
    '@id': 'https://swazdatarecovery.com/#organization'
  },
  areaServed: {
    '@type': 'Country',
    name: 'India'
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://swazdatarecovery.com/services/ransomware-recovery',
    servicePhone: {
      '@type': 'ContactPoint',
      telephone: '+91-9701087446',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi', 'Telugu', 'Tamil'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59'
      }
    }
  },
  offers: {
    '@type': 'Offer',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'INR',
      minPrice: '10000',
      maxPrice: '50000'
    }
  },
  termsOfService: 'No data recovered, no fee charged. Free consultation. Emergency 24/7 service available for critical business situations.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '38',
    bestRating: '5',
    worstRating: '1'
  }
};
