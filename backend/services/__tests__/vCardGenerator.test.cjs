/**
 * Unit tests for backend/services/vCardGenerator.js
 *
 * Tests:
 *  - vCard 4.0 format compliance (BEGIN/END markers, VERSION)
 *  - Core fields: FN, N, ORG, TITLE
 *  - Contact fields with visibility toggles: EMAIL, TEL, URL
 *  - Address fields (personal and company) with per-field visibility
 *  - NOTE (bio), PHOTO, REV, profile URL
 *  - X-SOCIALPROFILE for social links
 *  - escapeVCardValue special character handling
 *  - getVCardFilename sanitization
 *  - generateQRVCard minimal output
 */

const {
  generateVCard,
  generateQRVCard,
  getVCardFilename,
  escapeVCardValue,
} = require('../../services/vCardGenerator');

// ------------------------------------------------------------------
// escapeVCardValue
// ------------------------------------------------------------------

describe('escapeVCardValue', () => {
  test('returns empty string for null/undefined/empty input', () => {
    expect(escapeVCardValue(null)).toBe('');
    expect(escapeVCardValue(undefined)).toBe('');
    expect(escapeVCardValue('')).toBe('');
  });

  test('escapes backslashes', () => {
    expect(escapeVCardValue('a\\b')).toBe('a\\\\b');
  });

  test('escapes semicolons', () => {
    expect(escapeVCardValue('a;b')).toBe('a\\;b');
  });

  test('escapes commas', () => {
    expect(escapeVCardValue('a,b')).toBe('a\\,b');
  });

  test('converts newlines to \\n and strips carriage returns', () => {
    expect(escapeVCardValue('line1\r\nline2')).toBe('line1\\nline2');
    expect(escapeVCardValue('line1\nline2')).toBe('line1\\nline2');
  });

  test('converts non-string values to string first', () => {
    expect(escapeVCardValue(42)).toBe('42');
  });
});

// ------------------------------------------------------------------
// getVCardFilename
// ------------------------------------------------------------------

describe('getVCardFilename', () => {
  test('returns <username>.vcf for simple username', () => {
    expect(getVCardFilename('johndoe')).toBe('johndoe.vcf');
  });

  test('keeps hyphens and underscores', () => {
    expect(getVCardFilename('john-doe_99')).toBe('john-doe_99.vcf');
  });

  test('replaces special characters with underscores and appends .vcf', () => {
    expect(getVCardFilename('john@doe!?')).toBe('john_doe__.vcf');
    expect(getVCardFilename('hello world')).toBe('hello_world.vcf');
  });
});

// ------------------------------------------------------------------
// generateVCard  (full vCard 4.0)
// ------------------------------------------------------------------

describe('generateVCard', () => {
  const BASE_PROFILE = {
    username: 'testuser',
    display_name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    company: 'Acme Corp',
    headline: 'Software Engineer',
    public_email: 'test@example.com',
    public_phone: '+1234567890',
    website: 'https://example.com',
    bio: 'Hello world',
    avatar_url: 'https://example.com/avatar.jpg',
    updated_at: '2024-06-15T12:00:00.000Z',
  };

  test('starts with BEGIN:VCARD and ends with END:VCARD', () => {
    const vcard = generateVCard(BASE_PROFILE);
    const lines = vcard.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[lines.length - 1]).toBe('END:VCARD');
  });

  test('contains VERSION:4.0', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('VERSION:4.0');
  });

  test('contains FN with display_name', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('FN:Test User');
  });

  test('falls back to first_name + last_name when display_name is missing', () => {
    const profile = { ...BASE_PROFILE, display_name: '' };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('FN:Test User');
  });

  test('contains N with last;first format', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('N:User;Test;;;');
  });

  test('contains ORG when company is set', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('ORG:Acme Corp');
  });

  test('omits ORG when company is empty', () => {
    const profile = { ...BASE_PROFILE, company: '' };
    const vcard = generateVCard(profile);
    expect(vcard).not.toMatch(/^ORG:/m);
  });

  test('contains TITLE when headline is set', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('TITLE:Software Engineer');
  });

  test('uses profession over headline when both set', () => {
    const profile = { ...BASE_PROFILE, profession: 'Developer' };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('TITLE:Developer');
  });

  test('omits TITLE when headline and profession are empty', () => {
    const profile = { ...BASE_PROFILE, headline: '', profession: '' };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('TITLE:');
  });

  // -- Email visibility (vCard 4.0 uses lowercase type) --

  test('includes personal EMAIL when show_email is undefined (default visible)', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('EMAIL;TYPE=home:test@example.com');
  });

  test('hides personal EMAIL when show_email is 0', () => {
    const profile = { ...BASE_PROFILE, show_email: 0 };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('EMAIL;TYPE=home');
  });

  test('includes company EMAIL when company_email is set and visible', () => {
    const profile = { ...BASE_PROFILE, company_email: 'work@acme.com' };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('EMAIL;TYPE=work:work@acme.com');
  });

  test('hides company EMAIL when show_company_email is 0', () => {
    const profile = { ...BASE_PROFILE, company_email: 'work@acme.com', show_company_email: 0 };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('EMAIL;TYPE=work');
  });

  // -- Phone visibility (vCard 4.0 TEL format with VALUE=uri) --

  test('includes personal TEL in vCard 4.0 format when visible', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('TEL;TYPE="cell,voice";VALUE=uri:tel:+1234567890');
  });

  test('hides personal TEL when show_phone is 0', () => {
    const profile = { ...BASE_PROFILE, show_phone: 0 };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('TEL;TYPE="cell');
  });

  test('includes company TEL in vCard 4.0 format when visible', () => {
    const profile = { ...BASE_PROFILE, company_phone: '+9876543210' };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('TEL;TYPE="work,voice";VALUE=uri:tel:+9876543210');
  });

  test('hides company TEL when show_company_phone is 0', () => {
    const profile = { ...BASE_PROFILE, company_phone: '+9876543210', show_company_phone: 0 };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('TEL;TYPE="work');
  });

  test('strips non-numeric chars from phone except +', () => {
    const profile = { ...BASE_PROFILE, public_phone: '+1 (234) 567-890' };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('tel:+1234567890');
  });

  // -- Website visibility --

  test('includes URL when website is set and show_website is not 0', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('URL:https://example.com');
  });

  test('hides website URL when show_website is 0', () => {
    const profile = { ...BASE_PROFILE, show_website: 0 };
    const vcard = generateVCard(profile);
    // There should still be a profile URL but not the personal website URL
    const urlLines = vcard.split('\r\n').filter(l => l === 'URL:https://example.com');
    expect(urlLines.length).toBe(0);
  });

  // -- Personal address (vCard 4.0 uses lowercase type) --

  test('includes personal ADR when address fields are set', () => {
    const profile = {
      ...BASE_PROFILE,
      address_line1: '123 Main St',
      address_city: 'Springfield',
      address_state: 'IL',
      address_postal_code: '62704',
      address_country: 'US',
    };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('ADR;TYPE=home:;;123 Main St;Springfield;IL;62704;US');
  });

  test('respects per-field visibility for personal address', () => {
    const profile = {
      ...BASE_PROFILE,
      address_line1: '123 Main St',
      address_city: 'Springfield',
      address_state: 'IL',
      address_postal_code: '62704',
      show_address_city: 0,
    };
    const vcard = generateVCard(profile);
    // City should be empty when show_address_city is 0
    expect(vcard).toMatch(/ADR;TYPE=home:;;123 Main St;;IL;62704/);
  });

  test('omits personal ADR when no address data exists', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).not.toContain('ADR;TYPE=home');
  });

  // -- Company address --

  test('includes company ADR when company address fields are set', () => {
    const profile = {
      ...BASE_PROFILE,
      company_address_line1: '456 Corp Ave',
      company_address_city: 'Chicago',
      company_address_state: 'IL',
      company_address_postal_code: '60601',
      company_address_country: 'US',
    };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('ADR;TYPE=work:;;456 Corp Ave;Chicago;IL;60601;US');
  });

  test('respects per-field visibility for company address', () => {
    const profile = {
      ...BASE_PROFILE,
      company_address_line1: '456 Corp Ave',
      company_address_city: 'Chicago',
      show_company_address_line1: 0,
    };
    const vcard = generateVCard(profile);
    // street should be empty since show_company_address_line1 is 0
    expect(vcard).toMatch(/ADR;TYPE=work:;;;Chicago/);
  });

  // -- Bio (NOTE) --

  test('includes NOTE when bio is set', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('NOTE:Hello world');
  });

  test('omits NOTE when bio is empty', () => {
    const profile = { ...BASE_PROFILE, bio: '' };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('NOTE:');
  });

  // -- Avatar (PHOTO) --

  test('includes PHOTO when avatar_url is set', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('PHOTO;VALUE=URL:https://example.com/avatar.jpg');
  });

  test('omits PHOTO when avatar_url is empty', () => {
    const profile = { ...BASE_PROFILE, avatar_url: '' };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('PHOTO');
  });

  // -- Profile URL --

  test('includes profile URL', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('/u/testuser');
  });

  // -- Social profiles (X-SOCIALPROFILE) --

  test('includes X-SOCIALPROFILE entries for social links', () => {
    const socialLinks = [
      { platform_name: 'Twitter', platform_url: 'https://twitter.com/testuser' },
      { platform_name: 'LinkedIn', platform_url: 'https://linkedin.com/in/testuser' },
    ];
    const vcard = generateVCard(BASE_PROFILE, socialLinks);
    expect(vcard).toContain('X-SOCIALPROFILE;TYPE=Twitter:https://twitter.com/testuser');
    expect(vcard).toContain('X-SOCIALPROFILE;TYPE=LinkedIn:https://linkedin.com/in/testuser');
  });

  test('omits X-SOCIALPROFILE when no social links provided', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).not.toContain('X-SOCIALPROFILE');
  });

  test('uses "Social" as default platform name when platform_name is missing', () => {
    const socialLinks = [
      { platform_url: 'https://social.example.com/testuser' },
    ];
    const vcard = generateVCard(BASE_PROFILE, socialLinks);
    expect(vcard).toContain('X-SOCIALPROFILE;TYPE=Social:');
  });

  // -- REV (ISO 8601 in vCard 4.0) --

  test('includes REV in ISO 8601 format when updated_at is set', () => {
    const vcard = generateVCard(BASE_PROFILE);
    expect(vcard).toContain('REV:2024-06-15T12:00:00.000Z');
  });

  test('omits REV when updated_at is missing', () => {
    const profile = { ...BASE_PROFILE, updated_at: undefined };
    const vcard = generateVCard(profile);
    expect(vcard).not.toContain('REV:');
  });

  // -- Special character escaping in output --

  test('escapes special characters in field values', () => {
    const profile = {
      ...BASE_PROFILE,
      display_name: 'John; Doe, Jr.',
      bio: 'Line1\nLine2',
    };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('FN:John\\; Doe\\, Jr.');
    expect(vcard).toContain('NOTE:Line1\\nLine2');
  });

  // -- Address with line2 --

  test('combines address_line1 and address_line2 with comma separator', () => {
    const profile = {
      ...BASE_PROFILE,
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      address_city: 'Springfield',
    };
    const vcard = generateVCard(profile);
    expect(vcard).toContain('123 Main St\\, Apt 4B');
  });
});

// ------------------------------------------------------------------
// generateQRVCard  (minimal vCard 4.0 for QR codes)
// ------------------------------------------------------------------

describe('generateQRVCard', () => {
  const BASE_PROFILE = {
    username: 'testuser',
    display_name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    company: 'Acme Corp',
    public_email: 'test@example.com',
    public_phone: '+1234567890',
    website: 'https://example.com',
    company_email: 'work@acme.com',
    company_phone: '+9876543210',
  };

  test('starts with BEGIN:VCARD and ends with END:VCARD', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    const lines = vcard.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[lines.length - 1]).toBe('END:VCARD');
  });

  test('contains VERSION:4.0', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('VERSION:4.0');
  });

  test('contains FN and N fields', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('FN:Test User');
    expect(vcard).toContain('N:User;Test;;;');
  });

  test('includes ORG only when company name is under 30 chars', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('ORG:Acme Corp');
  });

  test('omits ORG when company name is 30+ characters', () => {
    const profile = {
      ...BASE_PROFILE,
      company: 'A Very Long Company Name That Exceeds The Thirty Character Threshold',
    };
    const vcard = generateQRVCard(profile);
    expect(vcard).not.toContain('ORG:');
  });

  test('prioritizes personal phone over company phone in vCard 4.0 format', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('TEL;TYPE="cell,voice";VALUE=uri:tel:+1234567890');
    expect(vcard).not.toContain('TEL;TYPE="work');
  });

  test('falls back to company phone when personal phone is hidden', () => {
    const profile = { ...BASE_PROFILE, show_phone: 0 };
    const vcard = generateQRVCard(profile);
    expect(vcard).not.toContain('TEL;TYPE="cell');
    expect(vcard).toContain('TEL;TYPE="work,voice";VALUE=uri:tel:+9876543210');
  });

  test('falls back to company phone when personal phone is absent', () => {
    const profile = { ...BASE_PROFILE, public_phone: '' };
    const vcard = generateQRVCard(profile);
    expect(vcard).toContain('TEL;TYPE="work,voice";VALUE=uri:tel:+9876543210');
  });

  test('prioritizes personal email over company email', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('EMAIL;TYPE=home:test@example.com');
    expect(vcard).not.toContain('EMAIL;TYPE=work');
  });

  test('falls back to company email when personal email is hidden', () => {
    const profile = { ...BASE_PROFILE, show_email: 0 };
    const vcard = generateQRVCard(profile);
    expect(vcard).not.toContain('EMAIL;TYPE=home');
    expect(vcard).toContain('EMAIL;TYPE=work:work@acme.com');
  });

  test('includes profile URL', () => {
    const vcard = generateQRVCard(BASE_PROFILE);
    expect(vcard).toContain('URL:');
    expect(vcard).toContain('/u/testuser');
  });

  test('does not include NOTE, PHOTO, ADR, TITLE, X-SOCIALPROFILE (kept minimal)', () => {
    const profile = {
      ...BASE_PROFILE,
      bio: 'Some bio',
      avatar_url: 'https://example.com/img.jpg',
      headline: 'Engineer',
      address_line1: '123 Main',
    };
    const vcard = generateQRVCard(profile);
    expect(vcard).not.toContain('NOTE:');
    expect(vcard).not.toContain('PHOTO');
    expect(vcard).not.toContain('TITLE:');
    expect(vcard).not.toContain('ADR');
    expect(vcard).not.toContain('X-SOCIALPROFILE');
  });
});
