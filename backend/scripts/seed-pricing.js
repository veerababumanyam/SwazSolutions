const path = require('path');
const db = require('../config/database');

const plans = [
  {
    service_type: "data-recovery",
    name: "Logical Recovery",
    price_inr: 8000,
    price_display: "₹8,000 - ₹15,000",
    billing_cycle: "one-time",
    features: JSON.stringify([
      "Deleted file recovery",
      "Formatted drive recovery",
      "Partition repair",
      "3-5 day turnaround",
      "No recovery, no fee"
    ]),
    is_featured: 0,
    sort_order: 1
  },
  {
    service_type: "data-recovery",
    name: "Mechanical Recovery",
    price_inr: 18000,
    price_display: "₹18,000 - ₹45,000",
    billing_cycle: "one-time",
    features: JSON.stringify([
      "Cleanroom head replacement",
      "Platter extraction",
      "Motor repair",
      "5-7 day turnaround",
      "98% success rate"
    ]),
    is_featured: 1,
    sort_order: 2
  },
  {
    service_type: "data-recovery",
    name: "Enterprise RAID",
    price_inr: 50000,
    price_display: "₹50,000 - ₹150,000",
    billing_cycle: "one-time",
    features: JSON.stringify([
      "Multi-drive RAID recovery",
      "Controller replacement",
      "Database repair",
      "Emergency 24-hour service",
      "Dedicated engineer"
    ]),
    is_featured: 0,
    sort_order: 3
  },
  {
    service_type: "data-recovery",
    name: "SSD Recovery",
    price_inr: 12000,
    price_display: "₹12,000 - ₹25,000",
    billing_cycle: "one-time",
    features: JSON.stringify([
      "Flash memory recovery",
      "Chip-off recovery",
      "Controller board repair",
      "4-6 day turnaround",
      "Encrypted data handling"
    ]),
    is_featured: 0,
    sort_order: 4
  }
];

async function seedPricing() {
  try {
    await db.ready;
    console.log('Database ready, seeding pricing plans...');

    for (const p of plans) {
      try {
        db.prepare(`
          INSERT INTO pricing_plans (service_type, name, price_inr, price_display, billing_cycle, features, is_featured, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(p.service_type, p.name, p.price_inr, p.price_display, p.billing_cycle, p.features, p.is_featured, p.sort_order);
      } catch (insertError) {
        if (!insertError.message.includes('UNIQUE')) {
          console.error('Error inserting pricing plan:', insertError.message);
        }
      }
    }

    console.log(`✅ Pricing plans seeded successfully (${plans.length} total)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed pricing plans:', error.message);
    process.exit(1);
  }
}

seedPricing();
