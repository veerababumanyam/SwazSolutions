// T069: vCard Generator Service
// Generates vCard 4.0 format for contact information
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
 * @property {string} [address_line1] - Personal address line 1
 * @property {string} [address_line2] - Personal address line 2
 * @property {string} [address_city] - Personal address city
 * @property {string} [address_state] - Personal address state
 * @property {string} [address_postal_code] - Personal address postal code
 * @property {number} [show_address] - Show personal address in vCard (1 = show, 0 = hide)
 * @property {string} [company_address_line1] - Company address line 1
 * @property {string} [company_address_line2] - Company address line 2
 * @property {string} [company_address_city] - Company address city
 * @property {string} [company_address_state] - Company address state
 * @property {string} [company_address_postal_code] - Company address postal code
 * @property {number} [show_company_address] - Show company address in vCard (1 = show, 0 = hide)
 * @property {string} [bio] - Biography/notes
 * @property {string} [avatar_url] - Avatar image URL
 * @property {string} username - Profile username
 * @property {string} [profession] - Profession/job title (preferred over headline)
 * @property {string|Date} [updated_at] - Last updated timestamp
 */

/**
 * @typedef {Object} SocialLink
 * @property {string} platform_name - Social platform name
 * @property {string} platform_url - Social platform URL
 */

/**
 * Generates a vCard 4.0 string from profile data
 * Respects visibility toggles for contact information
 * @param {Profile} profile - Profile data from database
 * @param {SocialLink[]} socialLinks - Optional social profile links
 * @returns {string} vCard formatted string
 */
function generateVCard(profile, socialLinks = []) {
  const lines = [];

  // vCard header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:4.0');

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

  // TITLE (Job Title/Profession - prefer profession field over headline)
  const jobTitle = profile.profession || profile.headline;
  if (jobTitle) {
    lines.push(`TITLE:${escapeVCardValue(jobTitle)}`);
  }

  // T071: Conditional fields based on privacy settings
  // Personal EMAIL (TYPE=home) - vCard 4.0 uses lowercase type parameters
  const showEmail = profile.show_email === undefined ? true : profile.show_email !== 0;
  if (profile.public_email && showEmail) {
    lines.push(`EMAIL;TYPE=home:${escapeVCardValue(profile.public_email)}`);
  }

  // Company EMAIL (TYPE=work) - vCard 4.0 uses lowercase type parameters
  const showCompanyEmail = profile.show_company_email === undefined ? true : profile.show_company_email !== 0;
  if (profile.company_email && showCompanyEmail) {
    lines.push(`EMAIL;TYPE=work:${escapeVCardValue(profile.company_email)}`);
  }

  // Personal TEL (TYPE=cell,voice) - vCard 4.0 format
  const showPhone = profile.show_phone === undefined ? true : profile.show_phone !== 0;
  if (profile.public_phone && showPhone) {
    lines.push(`TEL;TYPE="cell,voice";VALUE=uri:tel:${escapeVCardValue(profile.public_phone.replace(/[^0-9+]/g, ''))}`);
  }

  // Company TEL (TYPE=work,voice) - vCard 4.0 format
  const showCompanyPhone = profile.show_company_phone === undefined ? true : profile.show_company_phone !== 0;
  if (profile.company_phone && showCompanyPhone) {
    lines.push(`TEL;TYPE="work,voice";VALUE=uri:tel:${escapeVCardValue(profile.company_phone.replace(/[^0-9+]/g, ''))}`);
  }

  // Personal ADR (TYPE=HOME) - only if at least one visible field has data
  const showAddressLine1 = profile.show_address_line1 === undefined ? true : profile.show_address_line1 !== 0;
  const showAddressLine2 = profile.show_address_line2 === undefined ? true : profile.show_address_line2 !== 0;
  const showAddressCity = profile.show_address_city === undefined ? true : profile.show_address_city !== 0;
  const showAddressState = profile.show_address_state === undefined ? true : profile.show_address_state !== 0;
  const showAddressPostalCode = profile.show_address_postal_code === undefined ? true : profile.show_address_postal_code !== 0;
  const showAddressCountry = profile.show_address_country === undefined ? true : profile.show_address_country !== 0;
  
  const hasPersonalAddress = profile.address_line1 || profile.address_city || profile.address_state || profile.address_postal_code || profile.address_country;
  if (hasPersonalAddress) {
    // ADR format: PO Box;Extended Address;Street;City;State;Postal Code;Country
    const streetParts = [];
    if (showAddressLine1 && profile.address_line1) {streetParts.push(profile.address_line1);}
    if (showAddressLine2 && profile.address_line2) {streetParts.push(profile.address_line2);}
    const street = streetParts.join(', ');
    const city = showAddressCity ? (profile.address_city || '') : '';
    const state = showAddressState ? (profile.address_state || '') : '';
    const postalCode = showAddressPostalCode ? (profile.address_postal_code || '') : '';
    const country = showAddressCountry ? (profile.address_country || '') : '';
    // Only add ADR if at least one field has data
    if (street || city || state || postalCode || country) {
      lines.push(`ADR;TYPE=home:;;${escapeVCardValue(street)};${escapeVCardValue(city)};${escapeVCardValue(state)};${escapeVCardValue(postalCode)};${escapeVCardValue(country)}`);
    }
  }

  // Company ADR (TYPE=WORK) - only if at least one visible field has data
  const showCompanyAddressLine1 = profile.show_company_address_line1 === undefined ? true : profile.show_company_address_line1 !== 0;
  const showCompanyAddressLine2 = profile.show_company_address_line2 === undefined ? true : profile.show_company_address_line2 !== 0;
  const showCompanyAddressCity = profile.show_company_address_city === undefined ? true : profile.show_company_address_city !== 0;
  const showCompanyAddressState = profile.show_company_address_state === undefined ? true : profile.show_company_address_state !== 0;
  const showCompanyAddressPostalCode = profile.show_company_address_postal_code === undefined ? true : profile.show_company_address_postal_code !== 0;
  const showCompanyAddressCountry = profile.show_company_address_country === undefined ? true : profile.show_company_address_country !== 0;
  
  const hasCompanyAddress = profile.company_address_line1 || profile.company_address_city || profile.company_address_state || profile.company_address_postal_code || profile.company_address_country;
  if (hasCompanyAddress) {
    // ADR format: PO Box;Extended Address;Street;City;State;Postal Code;Country
    const streetParts = [];
    if (showCompanyAddressLine1 && profile.company_address_line1) {streetParts.push(profile.company_address_line1);}
    if (showCompanyAddressLine2 && profile.company_address_line2) {streetParts.push(profile.company_address_line2);}
    const street = streetParts.join(', ');
    const city = showCompanyAddressCity ? (profile.company_address_city || '') : '';
    const state = showCompanyAddressState ? (profile.company_address_state || '') : '';
    const postalCode = showCompanyAddressPostalCode ? (profile.company_address_postal_code || '') : '';
    const country = showCompanyAddressCountry ? (profile.company_address_country || '') : '';
    // Only add ADR if at least one field has data
    if (street || city || state || postalCode || country) {
      lines.push(`ADR;TYPE=work:;;${escapeVCardValue(street)};${escapeVCardValue(city)};${escapeVCardValue(state)};${escapeVCardValue(postalCode)};${escapeVCardValue(country)}`);
    }
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

  // Profile URL (vCard 4.0 format)
  const profileUrl = `${process.env.BASE_URL || 'http://localhost:5173'}/u/${profile.username}`;
  lines.push(`URL:${escapeVCardValue(profileUrl)}`);

  // X-SOCIALPROFILE fields for social media links (vCard 4.0 extension)
  if (socialLinks && socialLinks.length > 0) {
    for (const social of socialLinks) {
      if (social.platform_url) {
        const platformName = social.platform_name || 'Social';
        lines.push(`X-SOCIALPROFILE;TYPE=${escapeVCardValue(platformName)}:${escapeVCardValue(social.platform_url)}`);
      }
    }
  }

  // REV (Last modified) - vCard 4.0 uses ISO 8601 timestamp format
  if (profile.updated_at) {
    const revDate = new Date(profile.updated_at).toISOString();
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
  if (!value) {return '';}

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
 * Generates a minimal vCard 4.0 string optimized for QR codes
 * Only includes essential fields to keep QR code density low
 * @param {Profile} profile - Profile data
 * @returns {string} Minimal vCard string
 */
function generateQRVCard(profile) {
  const lines = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:4.0');

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

  // TEL (Prioritize Cell, then Work) - vCard 4.0 format
  const showPhone = profile.show_phone === undefined ? true : profile.show_phone !== 0;
  const showCompanyPhone = profile.show_company_phone === undefined ? true : profile.show_company_phone !== 0;

  if (profile.public_phone && showPhone) {
    lines.push(`TEL;TYPE="cell,voice";VALUE=uri:tel:${escapeVCardValue(profile.public_phone.replace(/[^0-9+]/g, ''))}`);
  } else if (profile.company_phone && showCompanyPhone) {
    lines.push(`TEL;TYPE="work,voice";VALUE=uri:tel:${escapeVCardValue(profile.company_phone.replace(/[^0-9+]/g, ''))}`);
  }

  // EMAIL (Prioritize Personal, then Work) - vCard 4.0 format
  const showEmail = profile.show_email === undefined ? true : profile.show_email !== 0;
  const showCompanyEmail = profile.show_company_email === undefined ? true : profile.show_company_email !== 0;

  if (profile.public_email && showEmail) {
    lines.push(`EMAIL;TYPE=home:${escapeVCardValue(profile.public_email)}`);
  } else if (profile.company_email && showCompanyEmail) {
    lines.push(`EMAIL;TYPE=work:${escapeVCardValue(profile.company_email)}`);
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
