import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SchemaProps {
    type: 'Organization' | 'LocalBusiness' | 'SoftwareApplication' | 'FAQPage' | 'BreadcrumbList' | 'WebApplication';
    data: any;
}

/**
 * Schema component for injecting JSON-LD structured data
 * Supports all major schema types for SEO
 */
export const Schema: React.FC<SchemaProps> = ({ type, data }) => {
    const schemaData = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

// Pre-configured schema data for reuse
export const organizationSchema = {
    name: 'Swaz Solutions',
    description: 'Professional data recovery services and AI-powered lyric generation platform',
    url: 'https://www.swazsolutions.com',
    logo: 'https://www.swazsolutions.com/assets/SwazLogo.webp',
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-DATA-911',
        contactType: 'Customer Service',
        availableLanguage: ['English', 'Telugu', 'Tamil', 'Hindi'],
        areaServed: 'US'
    },
    sameAs: [
        'https://twitter.com/swazsolutions',
        'https://linkedin.com/company/swazsolutions',
        'https://facebook.com/swazsolutions'
    ]
};

export const localBusinessSchema = {
    '@id': 'https://www.swazsolutions.com/#organization',
    name: 'Swaz Solutions Data Recovery',
    description: 'Professional data recovery services with 98% success rate. RAID, SSD, HDD, and flash media recovery specialists.',
    url: 'https://www.swazsolutions.com',
    telephone: '+1-555-DATA-911',
    email: 'support@swazsolutions.com',
    address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Tech Boulevard',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94102',
        addressCountry: 'US'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: '37.7749',
        longitude: '-122.4194'
    },
    openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59'
    },
    priceRange: '$$-$$$',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '127',
        bestRating: '5',
        worstRating: '1'
    },
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Data Recovery Services',
        itemListElement: [
            {
                '@type': 'Service',
                name: 'Hard Drive Data Recovery',
                description: 'Mechanical and logical hard drive recovery with cleanroom head swaps'
            },
            {
                '@type': 'Service',
                name: 'RAID Array Recovery',
                description: 'Enterprise RAID 0, 1, 5, 6, 10 recovery with virtual destriping'
            },
            {
                '@type': 'Service',
                name: 'SSD & Flash Media Recovery',
                description: 'NAND chip-off recovery for SSDs, USB drives, and SD cards'
            }
        ]
    }
};

export const dataRecoveryFAQSchema = {
    mainEntity: [
        {
            '@type': 'Question',
            name: 'How much does data recovery cost?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'We provide a free diagnostic evaluation within 4-6 hours. Standard recovery fees range from $300-$1,500 depending on failure type and complexity.'
            }
        },
        {
            '@type': 'Question',
            name: 'What is your success rate for data recovery?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Swaz Solutions maintains a 98% success rate across all recovery types including mechanical failures, RAID arrays, SSDs, and logical corruption. Our certified cleanroom facility and proprietary recovery tools enable us to recover data that other providers cannot.'
            }
        },
        {
            '@type': 'Question',
            name: 'How long does data recovery take?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Standard data recovery takes 3-5 business days after approval. Emergency 24/7 service is available for critical business cases, with turnaround times of 24-48 hours. Free diagnostic evaluation is completed within 4-6 hours of receiving your device.'
            }
        },
        {
            '@type': 'Question',
            name: 'Is my data safe and confidential?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes. Swaz Solutions operates a certified facility with biometric access controls. We are HIPAA and GDPR compliant. All data is encrypted during transfer and stored in secure, isolated environments. We maintain strict chain-of-custody protocols and can execute NDAs for sensitive cases.'
            }
        },
        {
            '@type': 'Question',
            name: 'What should I do if my hard drive is clicking?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Power off the drive immediately. A clicking sound indicates mechanical head failure. Continued operation will cause permanent platter damage. Do not attempt DIY recovery or freezer tricks. Ship the drive to our cleanroom facility where we perform professional head swaps in a Class 100 environment.'
            }
        }
    ]
};

export const lyricStudioSoftwareSchema = {
    name: 'Swaz Lyric Studio',
    applicationCategory: 'MultimediaApplication',
    description: 'AI-powered lyric generation with cultural intelligence. Generate production-ready songs in 23 languages including Tamil, Telugu, Hindi with Suno.com integration.',
    operatingSystem: 'Web Browser',
    url: 'https://www.swazsolutions.com/#/studio',
    softwareVersion: '2.0',
    releaseDate: '2025-11-01',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '342',
        bestRating: '5',
        worstRating: '1'
    },
    author: {
        '@type': 'Organization',
        name: 'Swaz Solutions'
    },
    featureList: [
        'Multi-Agent AI Architecture',
        '23 Language Support with Native Scripts',
        'Samskara Cultural Context Engine',
        'Suno.com & Udio Export Ready',
        'AABB, ABAB, ABCB Rhyme Schemes',
        'Album Art Generation',
        'Plagiarism Detection',
        'Real-time Lyric Preview',
        'Magic Rhyme Fixing',
        'HQ Audio Tag Generation'
    ],
    inLanguage: ['en', 'te', 'ta', 'hi', 'kn', 'ml', 'bn', 'pa', 'mr', 'gu', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'ru', 'tr', 'nl', 'pl']
};

export const cameraUpdatesFAQSchema = {
    mainEntity: [
        {
            '@type': 'Question',
            name: 'How often are camera firmware updates released?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Camera manufacturers typically release firmware updates every 3-6 months for their flagship models. Critical security or bug fix updates may be released more frequently. Swaz Solutions tracks and aggregates all updates daily from Canon, Nikon, and Sony official sources.'
            }
        },
        {
            '@type': 'Question',
            name: 'Should I update my camera firmware immediately?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'For critical security or bug fixes marked as high priority, yes. For feature updates, we recommend waiting 1-2 weeks to ensure the firmware is stable and tested by the community. Always backup your camera settings before updating and use a fully charged battery.'
            }
        },
        {
            '@type': 'Question',
            name: 'What are the risks of firmware updates?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'While rare, firmware updates can fail if interrupted during installation (battery dies, card removed). This may require service center recovery. Always follow manufacturer instructions: use original batteries, format SD cards, and never power off during update. Our platform flags critical vs optional updates to help you decide.'
            }
        }
    ]
};

export const musicPlayerSchema = {
    name: 'Swaz Music Player',
    applicationCategory: 'MultimediaApplication',
    description: 'Copyright-free music streaming player with high-quality tracks for content creators. No licensing fees, no attribution required.',
    operatingSystem: 'Web Browser',
    url: 'https://www.swazsolutions.com/#/music',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
    },
    author: {
        '@type': 'Organization',
        name: 'Swaz Solutions'
    },
    featureList: [
        'Copyright-Free Music Library',
        'High-Quality Audio Streaming',
        'No Attribution Required',
        'Playlist Management',
        'Lyrics Display',
        'Keyboard Shortcuts',
        'Responsive Design'
    ]
};

export const agenticAIServiceSchema = {
    name: 'Agentic AI Development Services',
    description: 'Enterprise-grade autonomous AI agents for complex task automation, decision-making, and workflow orchestration using OpenAI, Anthropic Claude, Google Gemini, and Meta Llama.',
    url: 'https://www.swazsolutions.com/#/agentic-ai',
    provider: {
        '@type': 'Organization',
        name: 'Swaz Solutions',
        url: 'https://www.swazsolutions.com'
    },
    serviceType: 'Software Development',
    areaServed: 'US',
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Agentic AI Solutions',
        itemListElement: [
            {
                '@type': 'Service',
                name: 'Autonomous Agents',
                description: 'Task-driven agents capable of planning, reasoning, and executing workflows end-to-end'
            },
            {
                '@type': 'Service',
                name: 'Multi-Agent Systems',
                description: 'Collaborative agents that communicate, negotiate, and coordinate to achieve shared goals'
            },
            {
                '@type': 'Service',
                name: 'Custom Knowledge Models',
                description: 'Fine-tuned AI models tailored to enterprise processes and compliance needs'
            }
        ]
    }
};
