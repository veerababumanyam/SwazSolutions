/**
 * System Template Definitions
 * 15 pre-built professional templates across 5 categories
 * Each template includes theme, blocks, and social profile suggestions
 */

const SYSTEM_TEMPLATES = [
  // ============================================================================
  // PROFESSIONAL CATEGORY (5 templates)
  // ============================================================================

  {
    name: 'Corporate Executive',
    description: 'Clean, modern design perfect for executives and C-suite professionals. Emphasizes credibility and authority.',
    category: 'Professional',
    tags: 'corporate,executive,formal,professional,dark',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#1F2937',
        secondary: '#3B82F6',
        background: '#FFFFFF',
        text: '#111827',
        blockBg: '#F3F4F6',
        accent: '#DC2626'
      },
      typography: {
        fontFamily: 'Georgia, serif',
        headingSize: 36,
        bodySize: 14,
        weight: 'bold'
      },
      layout: {
        style: 'corporate',
        spacing: 'comfortable',
        borderRadius: 4,
        alignment: 'center'
      },
      avatar: 'square-rounded',
      headerBackground: 'gradient-dark'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Professional Bio', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'LinkedIn Profile', url: 'https://linkedin.com', displayOrder: 2 },
      { type: 'LINK', title: 'Company Website', url: null, displayOrder: 3 },
      { type: 'CONTACT_FORM', title: 'Get in Touch', url: null, displayOrder: 4 }
    ],
    social_profiles_config: [
      { platform: 'LinkedIn', displayOrder: 1 },
      { platform: 'Twitter', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  {
    name: 'Lawyer/Consultant',
    description: 'Professional template with emphasis on credentials, certifications, and trust indicators.',
    category: 'Professional',
    tags: 'legal,consultant,professional,credentials,formal',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#0C3142',
        secondary: '#B91C1C',
        background: '#FFFFFF',
        text: '#0F172A',
        blockBg: '#E2E8F0',
        accent: '#DC2626'
      },
      typography: {
        fontFamily: 'Garamond, serif',
        headingSize: 32,
        bodySize: 13,
        weight: '600'
      },
      layout: {
        style: 'formal',
        spacing: 'spacious',
        borderRadius: 2,
        alignment: 'left'
      },
      avatar: 'square',
      headerBackground: 'solid-navy'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Credentials & Experience', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Specializations', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Bar License', url: null, displayOrder: 3 },
      { type: 'CONTACT_FORM', title: 'Schedule Consultation', url: null, displayOrder: 4 },
      { type: 'TEXT', title: 'Office Location', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'LinkedIn', displayOrder: 1 },
      { platform: 'Twitter', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  {
    name: 'Financial Professional',
    description: 'Trustworthy design for financial advisors, accountants, and wealth managers. Builds confidence.',
    category: 'Professional',
    tags: 'finance,accounting,advisor,trust,professional',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#064E3B',
        secondary: '#059669',
        background: '#F9FAFB',
        text: '#111827',
        blockBg: '#ECFDF5',
        accent: '#10B981'
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        headingSize: 34,
        bodySize: 14,
        weight: '500'
      },
      layout: {
        style: 'professional',
        spacing: 'moderate',
        borderRadius: 6,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-green'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Professional Summary', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Credentials', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Client Portal', url: null, displayOrder: 3 },
      { type: 'CONTACT_FORM', title: 'Schedule Meeting', url: null, displayOrder: 4 },
      { type: 'LINK', title: 'Company Website', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'LinkedIn', displayOrder: 1 },
      { platform: 'Twitter', displayOrder: 2 }
    ]
  },

  {
    name: 'Medical Professional',
    description: 'Healthcare-focused template for doctors, therapists, and medical professionals. Professional and caring.',
    category: 'Professional',
    tags: 'healthcare,doctor,medical,professional,trustworthy',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#0369A1',
        secondary: '#0EA5E9',
        background: '#FFFFFF',
        text: '#0C2340',
        blockBg: '#E0F2FE',
        accent: '#06B6D4'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingSize: 33,
        bodySize: 14,
        weight: '500'
      },
      layout: {
        style: 'medical',
        spacing: 'comfortable',
        borderRadius: 8,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-blue'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Medical License & Credentials', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Practice Information', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Patient Portal', url: null, displayOrder: 3 },
      { type: 'CONTACT_FORM', title: 'Appointment Request', url: null, displayOrder: 4 },
      { type: 'MAP_LOCATION', title: 'Office Location', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'LinkedIn', displayOrder: 1 },
      { platform: 'Email', displayOrder: 2 }
    ]
  },

  {
    name: 'Academic Professional',
    description: 'Perfect for professors, researchers, and academics. Highlights publications and research.',
    category: 'Professional',
    tags: 'academic,professor,research,education,professional',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#5B21B6',
        secondary: '#A855F7',
        background: '#FAFAFA',
        text: '#1F2937',
        blockBg: '#F3E8FF',
        accent: '#D946EF'
      },
      typography: {
        fontFamily: 'Lora, serif',
        headingSize: 35,
        bodySize: 14,
        weight: '600'
      },
      layout: {
        style: 'academic',
        spacing: 'spacious',
        borderRadius: 3,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-purple'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Academic Background', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Publications & Research', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'University Profile', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'CV/Resume', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Contact', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'ResearchGate', displayOrder: 1 },
      { platform: 'LinkedIn', displayOrder: 2 },
      { platform: 'Twitter', displayOrder: 3 }
    ]
  },

  // ============================================================================
  // CREATIVE CATEGORY (5 templates)
  // ============================================================================

  {
    name: 'Photographer Portfolio',
    description: 'Stunning visual template for photographers. Gallery-focused with call-to-action buttons.',
    category: 'Creative',
    tags: 'photographer,portfolio,creative,visual,gallery',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        background: '#0F0F0F',
        text: '#FFFFFF',
        blockBg: '#1A1A1A',
        accent: '#FFD700'
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        headingSize: 48,
        bodySize: 14,
        weight: 'bold'
      },
      layout: {
        style: 'gallery',
        spacing: 'minimal',
        borderRadius: 0,
        alignment: 'center'
      },
      avatar: 'square',
      headerBackground: 'solid-black'
    },
    blocks_config: [
      { type: 'TEXT', title: 'About My Work', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'View Portfolio', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Book a Session', url: null, displayOrder: 3 },
      { type: 'CONTACT_FORM', title: 'Inquire About Rates', url: null, displayOrder: 4 }
    ],
    social_profiles_config: [
      { platform: 'Instagram', displayOrder: 1 },
      { platform: 'Facebook', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  {
    name: 'Artist Creative Profile',
    description: 'Vibrant and artistic template for painters, illustrators, and digital artists. Showcase your creativity.',
    category: 'Creative',
    tags: 'artist,creative,art,colorful,portfolio',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#EC4899',
        secondary: '#F43F5E',
        background: '#FDF2F8',
        text: '#831843',
        blockBg: '#FCE7F3',
        accent: '#DB2777'
      },
      typography: {
        fontFamily: 'Fredoka, sans-serif',
        headingSize: 42,
        bodySize: 15,
        weight: '600'
      },
      layout: {
        style: 'artistic',
        spacing: 'generous',
        borderRadius: 20,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-pink'
    },
    blocks_config: [
      { type: 'TEXT', title: 'My Art Philosophy', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Online Gallery', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Commission Inquiries', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Shop My Work', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Get in Touch', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Instagram', displayOrder: 1 },
      { platform: 'Pinterest', displayOrder: 2 },
      { platform: 'Twitter', displayOrder: 3 }
    ]
  },

  {
    name: 'Music Producer/DJ',
    description: 'High-energy template for musicians, producers, and DJs. Streaming and booking focused.',
    category: 'Creative',
    tags: 'music,producer,dj,artist,creative',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        background: '#1A1625',
        text: '#F3F4F6',
        blockBg: '#2D1B69',
        accent: '#A78BFA'
      },
      typography: {
        fontFamily: 'Space Mono, monospace',
        headingSize: 45,
        bodySize: 14,
        weight: 'bold'
      },
      layout: {
        style: 'music',
        spacing: 'tight',
        borderRadius: 12,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-purple-pink'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Latest Releases', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Spotify', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'SoundCloud', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Book for Events', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Collaboration Inquiries', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Spotify', displayOrder: 1 },
      { platform: 'YouTube', displayOrder: 2 },
      { platform: 'Instagram', displayOrder: 3 },
      { platform: 'SoundCloud', displayOrder: 4 }
    ]
  },

  {
    name: 'Writer/Author',
    description: 'Minimalist template for writers, bloggers, and authors. Focus on content and storytelling.',
    category: 'Creative',
    tags: 'writer,author,blog,storytelling,creative',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#78350F',
        secondary: '#D97706',
        background: '#FFFBEB',
        text: '#451A03',
        blockBg: '#FEF3C7',
        accent: '#B45309'
      },
      typography: {
        fontFamily: 'Merriweather, serif',
        headingSize: 40,
        bodySize: 16,
        weight: '400'
      },
      layout: {
        style: 'literary',
        spacing: 'spacious',
        borderRadius: 0,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'solid-cream'
    },
    blocks_config: [
      { type: 'TEXT', title: 'About My Writing', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Latest Blog Posts', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Published Works', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Newsletter Signup', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Contact Me', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Twitter', displayOrder: 1 },
      { platform: 'Medium', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  {
    name: 'Content Creator/Influencer',
    description: 'Dynamic template for YouTubers, streamers, and social media influencers. Links to all platforms.',
    category: 'Creative',
    tags: 'influencer,content-creator,youtube,social-media,streamer',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#EF4444',
        secondary: '#FCA5A5',
        background: '#FEE2E2',
        text: '#7F1D1D',
        blockBg: '#FECACA',
        accent: '#DC2626'
      },
      typography: {
        fontFamily: 'Poppins, sans-serif',
        headingSize: 44,
        bodySize: 15,
        weight: '700'
      },
      layout: {
        style: 'vibrant',
        spacing: 'generous',
        borderRadius: 16,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-red'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Subscribe & Follow', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'YouTube Channel', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Twitch Stream', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Discord Server', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Collaborations', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'YouTube', displayOrder: 1 },
      { platform: 'Instagram', displayOrder: 2 },
      { platform: 'TikTok', displayOrder: 3 },
      { platform: 'Twitch', displayOrder: 4 }
    ]
  },

  // ============================================================================
  // BUSINESS CATEGORY (2 templates)
  // ============================================================================

  {
    name: 'Startup/Entrepreneur',
    description: 'Modern, innovative template for startups and entrepreneurs. Pitch-ready and investment-focused.',
    category: 'Business',
    tags: 'startup,entrepreneur,innovation,business,pitch',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        background: '#EFF6FF',
        text: '#0C2340',
        blockBg: '#DBEAFE',
        accent: '#0284C7'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingSize: 38,
        bodySize: 14,
        weight: '600'
      },
      layout: {
        style: 'startup',
        spacing: 'comfortable',
        borderRadius: 10,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'gradient-blue'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Our Mission', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Product Demo', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Investment Deck', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Company Website', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Get Early Access', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'LinkedIn', displayOrder: 1 },
      { platform: 'Twitter', displayOrder: 2 },
      { platform: 'GitHub', displayOrder: 3 }
    ]
  },

  {
    name: 'E-Commerce Business',
    description: 'Sales-focused template for online stores. Shop buttons and product showcases.',
    category: 'Business',
    tags: 'ecommerce,shop,business,sales,online-store',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        background: '#F0FDF4',
        text: '#065F46',
        blockBg: '#D1FAE5',
        accent: '#34D399'
      },
      typography: {
        fontFamily: 'Montserrat, sans-serif',
        headingSize: 36,
        bodySize: 14,
        weight: '700'
      },
      layout: {
        style: 'commerce',
        spacing: 'moderate',
        borderRadius: 8,
        alignment: 'center'
      },
      avatar: 'square',
      headerBackground: 'gradient-green'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Special Offer', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Shop Now', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Best Sellers', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Customer Reviews', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Customer Support', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Facebook', displayOrder: 1 },
      { platform: 'Instagram', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  // ============================================================================
  // HOSPITALITY CATEGORY (2 templates)
  // ============================================================================

  {
    name: 'Restaurant/Cafe',
    description: 'Appetizing template for restaurants, cafes, and food businesses. Menu and reservation focused.',
    category: 'Hospitality',
    tags: 'restaurant,cafe,food,hospitality,dining',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#92400E',
        secondary: '#D97706',
        background: '#FFFBEB',
        text: '#6B3410',
        blockBg: '#FEF3C7',
        accent: '#FBBF24'
      },
      typography: {
        fontFamily: 'Playfair Display, serif',
        headingSize: 44,
        bodySize: 15,
        weight: '600'
      },
      layout: {
        style: 'luxury',
        spacing: 'spacious',
        borderRadius: 8,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'solid-warm'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Welcome to Our Restaurant', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'View Menu', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Reserve a Table', url: null, displayOrder: 3 },
      { type: 'MAP_LOCATION', title: 'Our Location', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Catering Inquiries', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Facebook', displayOrder: 1 },
      { platform: 'Instagram', displayOrder: 2 },
      { platform: 'Email', displayOrder: 3 }
    ]
  },

  {
    name: 'Hotel/Accommodation',
    description: 'Luxury template for hotels, resorts, and vacation rentals. Booking and amenities showcase.',
    category: 'Hospitality',
    tags: 'hotel,accommodation,resort,hospitality,luxury',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#0C2340',
        secondary: '#1E3A8A',
        background: '#F5F5F5',
        text: '#0F172A',
        blockBg: '#E0E7FF',
        accent: '#3B82F6'
      },
      typography: {
        fontFamily: 'Lora, serif',
        headingSize: 42,
        bodySize: 14,
        weight: '500'
      },
      layout: {
        style: 'luxury',
        spacing: 'spacious',
        borderRadius: 6,
        alignment: 'center'
      },
      avatar: 'square-rounded',
      headerBackground: 'gradient-deep-blue'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Welcome to Our Hotel', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'Book Your Stay', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Room Amenities', url: null, displayOrder: 3 },
      { type: 'MAP_LOCATION', title: 'Location & Directions', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Special Requests', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'Facebook', displayOrder: 1 },
      { platform: 'Instagram', displayOrder: 2 },
      { platform: 'Twitter', displayOrder: 3 }
    ]
  },

  // ============================================================================
  // TECHNICAL CATEGORY (1 template)
  // ============================================================================

  {
    name: 'Developer/Tech Professional',
    description: 'Code-focused template for software developers. GitHub, portfolio, and technical showcase.',
    category: 'Technical',
    tags: 'developer,programmer,coding,technical,software',
    is_system: true,
    theme_config: {
      colors: {
        primary: '#0F172A',
        secondary: '#1E293B',
        background: '#0F172A',
        text: '#E2E8F0',
        blockBg: '#1E293B',
        accent: '#06B6D4'
      },
      typography: {
        fontFamily: 'JetBrains Mono, monospace',
        headingSize: 40,
        bodySize: 13,
        weight: '600'
      },
      layout: {
        style: 'dev',
        spacing: 'compact',
        borderRadius: 6,
        alignment: 'center'
      },
      avatar: 'circular',
      headerBackground: 'solid-dark'
    },
    blocks_config: [
      { type: 'TEXT', title: 'Tech Stack & Skills', url: null, displayOrder: 1 },
      { type: 'LINK', title: 'GitHub Profile', url: null, displayOrder: 2 },
      { type: 'LINK', title: 'Portfolio Projects', url: null, displayOrder: 3 },
      { type: 'LINK', title: 'Resume/CV', url: null, displayOrder: 4 },
      { type: 'CONTACT_FORM', title: 'Get in Touch', url: null, displayOrder: 5 }
    ],
    social_profiles_config: [
      { platform: 'GitHub', displayOrder: 1 },
      { platform: 'LinkedIn', displayOrder: 2 },
      { platform: 'Twitter', displayOrder: 3 }
    ]
  }
];

/**
 * Seed system templates into database
 * @param {object} db - Database instance
 * @returns {Promise<object>} { successful: number, failed: number, errors: string[] }
 */
async function seedSystemTemplates(db) {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  try {
    console.log(`Seeding ${SYSTEM_TEMPLATES.length} system templates...`);

    for (const template of SYSTEM_TEMPLATES) {
      try {
        // Check if template already exists
        const existing = db.prepare(
          'SELECT id FROM vcard_templates WHERE name = ? AND is_system = 1'
        ).get(template.name);

        if (existing) {
          console.log(`✓ Template "${template.name}" already exists, skipping...`);
          results.successful++;
          continue;
        }

        // Insert template
        const stmt = db.prepare(`
          INSERT INTO vcard_templates (
            name,
            description,
            category,
            theme_config,
            blocks_config,
            social_profiles_config,
            is_system,
            is_ai_generated,
            tags,
            popularity,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `);

        stmt.run(
          template.name,
          template.description,
          template.category,
          JSON.stringify(template.theme_config),
          JSON.stringify(template.blocks_config),
          JSON.stringify(template.social_profiles_config),
          1, // is_system
          0, // is_ai_generated
          template.tags,
          0  // popularity starts at 0
        );

        console.log(`✓ Seeded template: "${template.name}"`);
        results.successful++;
      } catch (error) {
        const errorMsg = `Failed to seed template "${template.name}": ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.failed++;
      }
    }

    console.log(`✅ Template seeding complete: ${results.successful} successful, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Error during template seeding:', error);
    throw error;
  }
}

module.exports = {
  SYSTEM_TEMPLATES,
  seedSystemTemplates
};
