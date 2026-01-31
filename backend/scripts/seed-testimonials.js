const path = require('path');
const db = require('../config/database');

const testimonials = [
  {
    author_name: "Rajesh Kumar",
    author_role: "IT Manager",
    author_company: "TechCorp India",
    rating: 5,
    content: "Lost 3TB of critical RAID data. Swaz Solutions recovered 99% in 48 hours. Their cleanroom facility is world-class.",
    service_type: "data-recovery",
    verified: 1,
    featured: 1,
    approved: 1
  },
  {
    author_name: "Priya Sharma",
    author_role: "Business Owner",
    author_company: "Digital Marketing Co",
    rating: 5,
    content: "My laptop crashed with all client data. Swaz recovered everything flawlessly. Highly professional team!",
    service_type: "data-recovery",
    verified: 1,
    featured: 1,
    approved: 1
  },
  {
    author_name: "Amit Desai",
    author_role: "Software Engineer",
    author_company: "Tech Startup",
    rating: 5,
    content: "SSD failure destroyed our project backups. Swaz's engineers were experts. Fast, efficient, reliable.",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Dr. Meera Patel",
    author_role: "Research Director",
    author_company: "Medical Research Institute",
    rating: 5,
    content: "5 years of research data on a failing server. Swaz recovered it without any data loss. Simply outstanding!",
    service_type: "data-recovery",
    verified: 1,
    featured: 1,
    approved: 1
  },
  {
    author_name: "Vikram Singh",
    author_role: "CFO",
    author_company: "Manufacturing Ltd",
    rating: 5,
    content: "Enterprise RAID recovery after catastrophic failure. Swaz's expertise saved our business continuity. Highly recommended!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Anjali Gupta",
    author_role: "Creative Director",
    author_company: "Film Production Studio",
    rating: 5,
    content: "Recovered 500GB of video footage from a dead external drive. Swaz's turnaround was incredible. A lifesaver!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Rohan Verma",
    author_role: "E-commerce Manager",
    author_company: "Online Retail Store",
    rating: 5,
    content: "Database corruption nearly shut down our business. Swaz fixed it in 36 hours. Professional and transparent!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Neha Iyer",
    author_role: "Freelance Designer",
    author_company: "Self-Employed",
    rating: 5,
    content: "Lost years of portfolio work to hard drive failure. Swaz recovered everything. Forever grateful!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Sanjay Reddy",
    author_role: "IT Director",
    author_company: "Financial Services Co",
    rating: 5,
    content: "Ransomware attack threatened our operations. Swaz's specialized recovery team saved the day. Exceptional service!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  },
  {
    author_name: "Divya Nair",
    author_role: "Project Manager",
    author_company: "Consulting Firm",
    rating: 5,
    content: "SSD with encrypted backups got corrupted. Swaz handled the complexity beautifully. Top-tier recovery!",
    service_type: "data-recovery",
    verified: 1,
    featured: 0,
    approved: 1
  }
];

async function seedTestimonials() {
  try {
    await db.ready;
    console.log('Database ready, seeding testimonials...');

    for (const t of testimonials) {
      try {
        db.prepare(`
          INSERT INTO testimonials (author_name, author_role, author_company, rating, content, service_type, verified, featured, approved)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(t.author_name, t.author_role, t.author_company, t.rating, t.content, t.service_type, t.verified, t.featured, t.approved);
      } catch (insertError) {
        if (!insertError.message.includes('UNIQUE')) {
          console.error('Error inserting testimonial:', insertError.message);
        }
      }
    }

    console.log(`✅ Testimonials seeded successfully (${testimonials.length} total)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed testimonials:', error.message);
    process.exit(1);
  }
}

seedTestimonials();
