/**
 * Service Schema for Hard Drive Data Recovery
 * Provides structured data for search engines about HDD recovery services
 */

export const hardDriveRecoverySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://swazdatarecovery.com/services/hard-drive-recovery#service',
  serviceType: 'Hard Drive Data Recovery',
  name: 'Hard Drive Data Recovery Services India',
  description: 'Professional hard drive recovery for mechanical failures, head crashes, motor seizures, and logical corruption. Class 100 cleanroom facility with 98% success rate.',
  provider: {
    '@id': 'https://swazdatarecovery.com/#organization'
  },
  areaServed: {
    '@type': 'Country',
    name: 'India'
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://swazdatarecovery.com/services/hard-drive-recovery',
    servicePhone: {
      '@type': 'ContactPoint',
      telephone: '+91-9701087446',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi', 'Telugu', 'Tamil']
    }
  },
  offers: {
    '@type': 'Offer',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'INR',
      minPrice: '15000',
      maxPrice: '35000'
    }
  },
  termsOfService: 'No data recovered, no fee charged. Free diagnostics within 4-6 hours.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '87',
    bestRating: '5',
    worstRating: '1'
  }
};
