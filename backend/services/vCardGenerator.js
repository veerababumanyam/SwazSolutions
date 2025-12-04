// T069: vCard Generator Service
// Generates vCard 3.0 format for contact information

/**
 * @typedef {Object} Profile
 * @property {string} [display_name] - Display name
 * @property {string} [first_name] - First name
 * @property {string} [last_name] - Last name
 * @property {string} [company] - Company/Organization
 * @property {string} [headline] - Job title/headline
 * @property {string} [public_email] - Public email address
 * @property {string} [public_phone] - Public phone number
 * @property {string} [website] - Personal website URL
 * @property {string} [bio] - Biography/notes
 * @property {string} [avatar_url] - Avatar image URL
 * @property {string} username - Profile username
 * @property {string|Date} [updated_at] - Last updated timestamp
 */

/**
 * Generates a vCard 3.0 string from profile data
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
  // EMAIL (only if public_email is set)
  if (profile.public_email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(profile.public_email)}`);
  }
  
  // TEL (only if public_phone is set)
  if (profile.public_phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(profile.public_phone)}`);
  }
  
  // URL (Personal website)
  if (profile.website) {
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

module.exports = {
  generateVCard,
  getVCardFilename,
  escapeVCardValue
};
