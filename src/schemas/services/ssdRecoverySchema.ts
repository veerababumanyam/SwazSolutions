/**
 * Service Schema for SSD Data Recovery
 * Provides structured data for search engines about SSD/flash recovery services
 */

export const ssdRecoverySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://swazdatarecovery.com/services/ssd-recovery#service',
  serviceType: 'SSD Data Recovery',
  name: 'SSD and Flash Memory Data Recovery India',
  description: 'Professional SSD recovery for NAND flash failures, controller malfunctions, firmware corruption, and wear leveling issues. Specialized tools for solid state drives.',
  provider: {
    '@id': 'https://swazdatarecovery.com/#organization'
  },
  areaServed: {
    '@type': 'Country',
    name: 'India'
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://swazdatarecovery.com/services/ssd-recovery',
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
      minPrice: '18000',
      maxPrice: '45000'
    }
  },
  termsOfService: 'No data recovered, no fee charged. Free diagnostics within 4-6 hours.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '64',
    bestRating: '5',
    worstRating: '1'
  }
};
