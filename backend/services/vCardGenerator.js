// T069: vCard Generator Service
// Generates vCard 3.0 format for contact information
// WCAG 2.1 AA compliant with personal and company contact support

/**
 * @typedef {Object} Profile
 * @property {string} [display_name] - Display name
 * @property {string} [first_name] - First name
 * @property {string} [last_name] - Last name
 * @property {string} [company] - Company/Organization
 * @property {string} [headline] - Job title/headline
 * @property {string} [public_email] - Personal email address
 * @property {string} [public_phone] - Personal phone number
 * @property {string} [website] - Personal website URL
 * @property {string} [company_email] - Company email address
 * @property {string} [company_phone] - Company phone number
 * @property {number} [show_email] - Show personal email in vCard (1 = show, 0 = hide)
 * @property {number} [show_phone] - Show personal phone in vCard (1 = show, 0 = hide)
 * @property {number} [show_website] - Show website in vCard (1 = show, 0 = hide)
 * @property {number} [show_company_email] - Show company email in vCard (1 = show, 0 = hide)
 * @property {number} [show_company_phone] - Show company phone in vCard (1 = show, 0 = hide)
 * @property {string} [bio] - Biography/notes
 * @property {string} [avatar_url] - Avatar image URL
 * @property {string} username - Profile username
 * @property {string|Date} [updated_at] - Last updated timestamp
 */

/**
 * Generates a vCard 3.0 string from profile data
 * Respects visibility toggles for contact information
 * @param {Profile} profile - Profile data from database
 * @returns {string} vCard formatted string
 */
function generateVCard(profile) {
  const lines = [];

  // vCard header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // T070: Core fields
  // FN (Formatted Name) - required
  const displayName = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  if (displayName) {
    lines.push(`FN:${escapeVCardValue(displayName)}`);
  }

  // N (Name) - Last;First;Middle;Prefix;Suffix
  const lastName = profile.last_name || '';
  const firstName = profile.first_name || '';
  lines.push(`N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);

  // ORG (Organization)
  if (profile.company) {
    lines.push(`ORG:${escapeVCardValue(profile.company)}`);
  }

  // TITLE (Job Title/Headline)
  if (profile.headline) {
    lines.push(`TITLE:${escapeVCardValue(profile.headline)}`);
  }

  // T071: Conditional fields based on privacy settings
  // Personal EMAIL (TYPE=HOME) - only if enabled and set
  const showEmail = profile.show_email === undefined ? true : profile.show_email !== 0;
  if (profile.public_email && showEmail) {
    lines.push(`EMAIL;TYPE=HOME:${escapeVCardValue(profile.public_email)}`);
  }

  // Company EMAIL (TYPE=WORK) - only if enabled and set
  const showCompanyEmail = profile.show_company_email === undefined ? true : profile.show_company_email !== 0;
  if (profile.company_email && showCompanyEmail) {
    lines.push(`EMAIL;TYPE=WORK:${escapeVCardValue(profile.company_email)}`);
  }

  // Personal TEL (TYPE=CELL) - only if enabled and set
  const showPhone = profile.show_phone === undefined ? true : profile.show_phone !== 0;
  if (profile.public_phone && showPhone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(profile.public_phone)}`);
  }

  // Company TEL (TYPE=WORK) - only if enabled and set
  const showCompanyPhone = profile.show_company_phone === undefined ? true : profile.show_company_phone !== 0;
  if (profile.company_phone && showCompanyPhone) {
    lines.push(`TEL;TYPE=WORK:${escapeVCardValue(profile.company_phone)}`);
  }

  // URL (Personal website) - only if enabled and set
  const showWebsite = profile.show_website === undefined ? true : profile.show_website !== 0;
  if (profile.website && showWebsite) {
    lines.push(`URL:${escapeVCardValue(profile.website)}`);
  }

  // NOTE (Bio)
  if (profile.bio) {
    lines.push(`NOTE:${escapeVCardValue(profile.bio)}`);
  }

  // PHOTO (Avatar URL)
  if (profile.avatar_url) {
    lines.push(`PHOTO;VALUE=URL:${escapeVCardValue(profile.avatar_url)}`);
  }

  // Profile URL (using ADR extended format)
  const profileUrl = `${process.env.BASE_URL || 'http://localhost:5173'}/u/${profile.username}`;
  lines.push(`URL;TYPE=PROFILE:${escapeVCardValue(profileUrl)}`);

  // REV (Last modified)
  if (profile.updated_at) {
    const revDate = new Date(profile.updated_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(`REV:${revDate}`);
  }

  // vCard footer
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

/**
 * Escape special characters in vCard values
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeVCardValue(value) {
  if (!value) return '';

  return String(value)
    .replace(/\\/g, '\\\\')  // Backslash
    .replace(/;/g, '\\;')    // Semicolon
    .replace(/,/g, '\\,')    // Comma
    .replace(/\n/g, '\\n')   // Newline
    .replace(/\r/g, '');      // Remove carriage return
}

/**
 * Generate filename for vCard download
 * @param {string} username - Profile username
 * @returns {string} Filename
 */
function getVCardFilename(username) {
  const sanitized = username.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${sanitized}.vcf`;
}

/**
 * Generates a minimal vCard 3.0 string optimized for QR codes
 * Only includes essential fields to keep QR code density low
 * @param {Profile} profile - Profile data
 * @returns {string} Minimal vCard string
 */
function generateQRVCard(profile) {
  const lines = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // FN (Formatted Name) - required
  const displayName = profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  if (displayName) {
    lines.push(`FN:${escapeVCardValue(displayName)}`);
  }

  // N (Name)
  const lastName = profile.last_name || '';
  const firstName = profile.first_name || '';
  lines.push(`N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);

  // ORG (Organization) - Optional, keep if short
  if (profile.company && profile.company.length < 30) {
    lines.push(`ORG:${escapeVCardValue(profile.company)}`);
  }

  // T071: Conditional fields - Limit to one of each for QR

  // TEL (Prioritize Cell, then Work)
  const showPhone = profile.show_phone === undefined ? true : profile.show_phone !== 0;
  const showCompanyPhone = profile.show_company_phone === undefined ? true : profile.show_company_phone !== 0;

  if (profile.public_phone && showPhone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(profile.public_phone)}`);
  } else if (profile.company_phone && showCompanyPhone) {
    lines.push(`TEL;TYPE=WORK:${escapeVCardValue(profile.company_phone)}`);
  }

  // EMAIL (Prioritize Personal, then Work)
  const showEmail = profile.show_email === undefined ? true : profile.show_email !== 0;
  const showCompanyEmail = profile.show_company_email === undefined ? true : profile.show_company_email !== 0;

  if (profile.public_email && showEmail) {
    lines.push(`EMAIL;TYPE=HOME:${escapeVCardValue(profile.public_email)}`);
  } else if (profile.company_email && showCompanyEmail) {
    lines.push(`EMAIL;TYPE=WORK:${escapeVCardValue(profile.company_email)}`);
  }

  // URL (Profile URL is most important)
  const profileUrl = `${process.env.BASE_URL || 'http://localhost:5173'}/u/${profile.username}`;
  lines.push(`URL:${escapeVCardValue(profileUrl)}`);

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

module.exports = {
  generateVCard,
  generateQRVCard,
  getVCardFilename,
  escapeVCardValue
};
