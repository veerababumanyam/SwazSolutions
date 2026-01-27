/**
 * Expanded FAQ Schema for Data Recovery Services
 * 15-20 questions covering all aspects of data recovery
 * Optimized for AI search engine extraction (FAQPage schema is "PURE GOLD" for LLMs)
 */

export const dataRecoveryFAQExpanded = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    // === GENERAL DATA RECOVERY (4 questions) ===
    {
      '@type': 'Question',
      name: 'What is data recovery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data recovery is the process of retrieving inaccessible, lost, corrupted, damaged, or formatted data from storage devices such as hard drives, SSDs, USB drives, RAID arrays, and flash media. Professional data recovery involves specialized tools, cleanroom facilities, and expert techniques to recover data from mechanical failures, logical corruption, or physical damage. At Swaz Solutions, we use advanced recovery tools and a Class 100 cleanroom environment to achieve a 98% success rate across all device types and failure scenarios.'
      }
    },
    {
      '@type': 'Question',
      name: 'How much does data recovery cost in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Data recovery costs in India typically range from ₹5,000 to ₹75,000 depending on the failure type and complexity. At Swaz Solutions, we provide a free diagnostic evaluation within 4-6 hours. Standard logical recovery (deleted files, formatting) starts at ₹8,000. Mechanical hard drive recovery (head crashes, motor failures) ranges from ₹15,000-₹35,000. Complex RAID array recovery can cost ₹40,000-₹75,000 depending on the number of drives and RAID level. We offer fixed-price quotes with no hidden fees and a no-data-no-fee guarantee—if we cannot recover your data, you pay nothing.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is your success rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaz Solutions maintains a 98% success rate across all recovery types including mechanical failures, RAID arrays, SSDs, and logical corruption. Our certified cleanroom facility in Hyderabad and proprietary recovery tools enable us to recover data that other providers cannot. This high success rate is based on thousands of successful recoveries across all major storage device types. We provide honest assessments during our free diagnostic evaluation and will tell you upfront if recovery is not feasible.'
      }
    },
    {
      '@type': 'Question',
      name: 'How long does data recovery take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most data recovery projects are completed within 3-7 business days after approval. Simple logical recovery (deleted files) may be completed within 24-48 hours. Complex mechanical repairs or RAID reconstructions may take 7-14 days depending on the number of drives and extent of damage. Emergency 24/7 service is available for critical business data with expedited turnaround times of 24-48 hours. Our free diagnostic evaluation is completed within 4-6 hours of receiving your device, providing you with a detailed report and fixed-price quote.'
      }
    },

    // === TECHNICAL PROCESS (4 questions) ===
    {
      '@type': 'Question',
      name: 'What should I do if my hard drive is clicking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Power off the drive immediately and do not attempt to restart it. A clicking sound indicates mechanical head failure—the read/write heads are unable to properly access the platters. Continued operation will cause permanent platter damage and data loss. Do not attempt DIY recovery methods or freezer tricks as these can cause irreversible damage. Ship the drive to Swaz Solutions cleanroom facility where we perform professional head swaps in a Class 100 environment. Contact us at +91-9701087446 for immediate assistance and free diagnostic evaluation.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can you recover data from water-damaged drives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we can recover data from water-damaged storage devices in most cases. Water damage success depends on several factors: exposure duration, water type (fresh vs salt water), and whether the device was powered on during exposure. Our process involves: (1) Immediate disassembly in our cleanroom, (2) Ultrasonic cleaning of platters and components, (3) Component replacement if necessary, (4) Data extraction using specialized tools. Time is critical—water causes corrosion that worsens over time. Do not power on the device or attempt to dry it yourself. Ship it to us immediately for professional treatment.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you have a cleanroom facility?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Swaz Solutions operates a Class 100 cleanroom facility in Hyderabad for mechanical hard drive repairs. A cleanroom is essential for opening hard drives because even microscopic dust particles can cause head crashes and permanent data loss. Our Class 100 cleanroom maintains fewer than 100 particles (0.5 microns or larger) per cubic foot of air, providing the sterile environment required for head swaps, platter repairs, and component replacements. All mechanical recovery work is performed by trained technicians using specialized tools in this controlled environment.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is RAID destriping and how does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RAID destriping is the process of reconstructing data from multiple drives in a RAID array. RAID systems stripe (split) data across multiple drives for performance and redundancy. When a RAID fails, we must: (1) Image all drives to prevent further damage, (2) Analyze the RAID configuration (level, stripe size, parity layout), (3) Perform virtual destriping to reconstruct the original data structure, (4) Rebuild the file system and extract your data. This requires specialized RAID recovery tools and deep expertise in RAID architectures. We successfully recover RAID 0, 1, 5, 6, and 10 arrays with multiple drive failures.'
      }
    },

    // === SERVICE DETAILS (3 questions) ===
    {
      '@type': 'Question',
      name: 'Do you offer emergency 24/7 service?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Swaz Solutions offers 24/7 emergency data recovery service for critical business situations. Emergency service is available for urgent cases where data loss threatens business operations, financial reporting, legal proceedings, or time-sensitive projects. Emergency recovery prioritizes your case ahead of standard queue and provides expedited turnaround times of 24-48 hours. Emergency service includes after-hours diagnostic evaluation, weekend/holiday processing, and direct technician communication. Contact +91-9701087446 anytime for immediate emergency assistance.'
      }
    },
    {
      '@type': 'Question',
      name: 'What areas of India do you serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaz Solutions serves clients across all of India. Our primary facility is located in Hyderabad, Telangana, but we accept devices via secure courier service from anywhere in India. We provide detailed shipping instructions and can arrange pickup for high-value or large enterprise storage systems. Remote diagnostics and consultations are available via phone and video call. We serve individual consumers, small businesses, enterprises, and government organizations throughout India. Local clients in Hyderabad can drop off devices directly at our facility.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you provide free diagnostics?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we provide completely free diagnostic evaluation for all data recovery cases. Our diagnostic process takes 4-6 hours and includes: (1) Complete failure analysis to identify the root cause, (2) Assessment of recovery difficulty and success probability, (3) File list preview showing recoverable data, (4) Fixed-price quote with no hidden fees, (5) Detailed technical report. There is absolutely no obligation—if you decide not to proceed after receiving the diagnostic report, you pay nothing. This allows you to make an informed decision about whether to proceed with recovery.'
      }
    },

    // === BUSINESS & SECURITY (3 questions) ===
    {
      '@type': 'Question',
      name: 'Is my data safe and confidential?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Data security and confidentiality are our top priorities. Swaz Solutions operates a secure facility with strict access controls and confidentiality protocols. All data is encrypted during transfer and stored in secure, isolated environments. We maintain strict chain-of-custody protocols documenting every step of the recovery process. Your data is never shared, sold, or retained after the recovery is complete. We can execute NDAs (Non-Disclosure Agreements) for sensitive cases involving proprietary business data, legal evidence, or confidential information. After data return, we securely wipe or destroy all copies per your instructions.'
      }
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaz Solutions accepts multiple payment methods for your convenience: Cash (for local clients), Bank Transfer/NEFT/RTGS (for remote clients), UPI (PhonePe, Google Pay, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), and Cheque (for enterprise clients). Payment is only required after successful data recovery and verification. We operate on a no-data-no-fee guarantee—if we cannot recover your data, you pay nothing except return shipping costs if applicable. For enterprise clients, we offer NET 30 payment terms after credit approval.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do you offer a no-data-no-fee guarantee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Swaz Solutions offers a strict no-data-no-fee guarantee on all data recovery services. You only pay if we successfully recover your data. After our free diagnostic evaluation, we provide a fixed-price quote and file list preview. If you approve, we proceed with recovery. If we are unable to recover any data or cannot recover the specific critical files you need, you pay nothing except return shipping costs if applicable. This guarantee demonstrates our confidence in our 98% success rate and ensures you have no financial risk when trusting us with your data recovery needs.'
      }
    },

    // === PREVENTION (3 questions) ===
    {
      '@type': 'Question',
      name: 'How can I prevent data loss?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Follow the 3-2-1 backup rule: Keep 3 copies of important data, on 2 different storage types (e.g., internal drive + external hard drive), with 1 copy offsite (cloud storage or remote location). Additional prevention tips: (1) Use surge protectors to prevent power damage, (2) Handle drives carefully—avoid drops and impacts, (3) Keep computers in cool, dry environments, (4) Safely eject external drives before disconnecting, (5) Use reputable antivirus software to prevent ransomware, (6) Monitor S.M.A.R.T. health status of drives, (7) Replace drives older than 3-5 years proactively. Regular backups are your best protection against data loss.'
      }
    },
    {
      '@type': 'Question',
      name: 'What are early signs of hard drive failure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Common warning signs of imminent hard drive failure include: (1) Clicking, grinding, or beeping sounds indicating mechanical problems, (2) Frequent freezing or extremely slow performance, (3) Files disappearing or becoming corrupted, (4) Increasing number of bad sectors reported by S.M.A.R.T. diagnostics, (5) Blue screen of death (BSOD) or system crashes, (6) Drive not being recognized by BIOS or operating system, (7) Error messages during boot or file access. If you notice any of these signs, immediately backup your data and contact Swaz Solutions at +91-9701087446. Early intervention can prevent total data loss and reduce recovery costs.'
      }
    },
    {
      '@type': 'Question',
      name: 'Should I attempt DIY data recovery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For logical failures (deleted files, formatted drives), consumer data recovery software may work for simple cases. However, for mechanical failures (clicking sounds, drive not spinning), physical damage (water, fire, impact), or critical business data, do not attempt DIY recovery. Common DIY mistakes that cause permanent damage: (1) Repeatedly powering on a failing drive, (2) Opening a hard drive outside a cleanroom (dust particles cause head crashes), (3) Using freezer method (causes condensation damage), (4) Swapping controller boards without matching firmware, (5) Using incorrect recovery software that overwrites data. Professional recovery at Swaz Solutions gives you the best chance of success. Our free diagnostic evaluation helps you make an informed decision.'
      }
    }
  ]
};
