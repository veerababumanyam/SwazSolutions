/**
 * Application Constants
 * Centralized constants to eliminate magic numbers and strings
 */

/**
 * Subscription-related constants
 */
const SUBSCRIPTION = {
  DURATION_MS: {
    YEAR: 365 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
  },
  STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    PENDING: 'pending',
    PAID: 'paid',
    FREE: 'free',
    CANCELLED: 'cancelled'
  },
  AMOUNT_PAISE: 200 * 100, // 200 INR in paise
  DEFAULT_FREE_DAYS: 30 // Default free trial period
};

/**
 * Database-related constants
 */
const DATABASE = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SAVE_DEBOUNCE_MS: 1000
};

/**
 * Boolean flag constants (for SQLite INTEGER columns)
 */
const BOOLEAN_FLAG = {
  TRUE: 1,
  FALSE: 0
};

/**
 * Invite-related constants
 */
const INVITE = {
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },
  EVENTS: {
    VIEW: 'view',
    RSVP: 'rsvp',
    SHARE: 'share'
  },
  DEFAULT_TEMPLATE: 'wc1'
};

/**
 * Guest-related constants
 */
const GUEST = {
  STATUS: {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined'
  },
  CATEGORY: {
    FAMILY: 'Family',
    FRIENDS: 'Friends',
    COLLEAGUES: 'Colleagues',
    OTHER: 'Other'
  }
};

/**
 * Payment provider constants
 */
const PAYMENT = {
  PROVIDER: {
    CASHFREE: 'cashfree',
    PHONEPE: 'phonepe',
    RUPEEPAYMENTS: 'rupeepayments'
  },
  STATUS: {
    SUCCESS: 'SUCCESS',
    PENDING: 'PENDING',
    FAILED: 'FAILED'
  }
};

/**
 * User role constants
 */
const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
};

/**
 * Support ticket constants
 */
const SUPPORT_TICKET = {
  STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },
  PRIORITY: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  CATEGORY: {
    GENERAL: 'general',
    TECHNICAL: 'technical',
    BILLING: 'billing',
    FEATURE: 'feature',
    BUG: 'bug'
  }
};

/**
 * Contact inquiry status constants
 */
const INQUIRY_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

/**
 * Analytics event types
 */
const ANALYTICS_EVENT = {
  VIEW: 'view',
  SHARE: 'share',
  RSVP: 'rsvp',
  QR_SCAN: 'qr_scan',
  VCARD_DOWNLOAD: 'vcard_download'
};

module.exports = {
  SUBSCRIPTION,
  DATABASE,
  BOOLEAN_FLAG,
  INVITE,
  GUEST,
  PAYMENT,
  USER_ROLE,
  SUPPORT_TICKET,
  INQUIRY_STATUS,
  ANALYTICS_EVENT
};
