/**
 * Service Schema for RAID Array Recovery
 * Provides structured data for search engines about enterprise RAID recovery services
 */

export const raidRecoverySchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://swazdatarecovery.com/services/raid-recovery#service',
  serviceType: 'RAID Array Data Recovery',
  name: 'RAID Array Recovery Services India',
  description: 'Enterprise RAID data recovery for RAID 0, 1, 5, 6, 10 arrays. Virtual destriping, multiple drive failure recovery, and NAS/SAN recovery. Business-critical data restoration.',
  provider: {
    '@id': 'https://swazdatarecovery.com/#organization'
  },
  areaServed: {
    '@type': 'Country',
    name: 'India'
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: 'https://swazdatarecovery.com/services/raid-recovery',
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
      minPrice: '40000',
      maxPrice: '75000'
    }
  },
  termsOfService: 'No data recovered, no fee charged. Free diagnostics within 4-6 hours. Emergency 24/7 service available.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '42',
    bestRating: '5',
    worstRating: '1'
  }
};
