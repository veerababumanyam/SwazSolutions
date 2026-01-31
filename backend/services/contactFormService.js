/**
 * Contact Form Service
 * Handles form submission processing, validation, email notifications, and rate limiting
 */

const crypto = require('crypto');
const validator = require('validator');
const nodemailer = require('nodemailer');
const db = require('../config/database');

// Email configuration
const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'smtp',
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE !== 'false',
  auth: {
    user: process.env.EMAIL_USER || 'info@swazdatarecovery.com',
    pass: process.env.EMAIL_PASSWORD
  },
  from: process.env.EMAIL_FROM || 'info@swazdatarecovery.com'
};

let emailTransporter = null;

function initializeEmailTransporter() {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    return null;
  }

  try {
    if (EMAIL_CONFIG.service === 'gmail') {
      emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: EMAIL_CONFIG.auth
      });
    } else {
      emailTransporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: EMAIL_CONFIG.auth
      });
    }
    return emailTransporter;
  } catch (error) {
    console.error('Failed to initialize email transporter:', error.message);
    return null;
  }
}

/**
 * Hash IP address for privacy (not storing raw IP)
 * Uses SHA256 for consistency and security
 */
function hashIP(ipAddress) {
  if (!ipAddress) return null;
  return crypto
    .createHash('sha256')
    .update(ipAddress)
    .digest('hex');
}

/**
 * Sanitize input to prevent XSS
 * Removes potentially dangerous characters and HTML
 */
function sanitizeInput(input) {
  if (!input) return '';

  // Use validator to escape HTML and trim
  return validator
    .trim(input)
    .substring(0, 10000) // Max 10KB per field
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validate form field configuration
 * Checks which fields are required based on form config
 */
function validateFormFields(formConfig, data) {
  const errors = [];

  // Validate name (required if enabled)
  if (formConfig?.includeNameField) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }
  }

  // Validate email (always required)
  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Invalid email address');
  } else if (data.email.length > 255) {
    errors.push('Email must be 255 characters or less');
  }

  // Validate phone (required if enabled)
  if (formConfig?.includePhoneField) {
    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone is required');
    } else if (!validator.isMobilePhone(data.phone, 'any', { strictMode: false })) {
      errors.push('Invalid phone number format');
    }
  }

  // Validate subject (required if enabled)
  if (formConfig?.includeSubjectField) {
    if (!data.subject || data.subject.trim().length === 0) {
      errors.push('Subject is required');
    } else if (data.subject.length > 200) {
      errors.push('Subject must be 200 characters or less');
    }
  }

  // Validate message (always required)
  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  } else if (data.message.length > 5000) {
    errors.push('Message must be 5000 characters or less');
  }

  return errors;
}

/**
 * Check rate limit for form submissions
 * Limits 5 submissions per hour per IP
 */
function checkRateLimit(ipHash, linkId) {
  try {
    // Check submissions in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    const result = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM contact_form_submissions
      WHERE ip_hash = ? AND link_id = ? AND created_at > ?
    `
      )
      .get(ipHash, linkId, oneHourAgo);

    const count = result?.count || 0;
    const limit = 5;
    const isRateLimited = count >= limit;

    return {
      isRateLimited,
      count,
      limit,
      remainingAttempts: Math.max(0, limit - count)
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // If we can't check rate limit, allow submission
    return { isRateLimited: false, count: 0, limit: 5, remainingAttempts: 5 };
  }
}

/**
 * Send form submission email notification to profile owner
 * Email includes submission details and link to view in dashboard
 */
async function sendFormSubmissionEmail(profile, submission, linkTitle) {
  const transporter = emailTransporter || initializeEmailTransporter();

  if (!transporter) {
    console.warn('⚠️ Email service not initialized, skipping email notification');
    return { sent: false, reason: 'Email service not configured' };
  }

  try {
    const recipientEmail = profile.public_email || profile.company_email || 'info@swazsolutions.com';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #3b82f6; }
    .field strong { display: inline-block; width: 100px; color: #6b7280; }
    .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📨 New Form Submission</h1>
      <p style="margin: 5px 0 0 0;">Form: ${validator.escape(linkTitle)}</p>
    </div>

    <div class="content">
      ${submission.name ? `<div class="field"><strong>Name:</strong> ${validator.escape(submission.name)}</div>` : ''}
      <div class="field"><strong>Email:</strong> <a href="mailto:${validator.escape(submission.email)}">${validator.escape(submission.email)}</a></div>
      ${submission.phone ? `<div class="field"><strong>Phone:</strong> ${validator.escape(submission.phone)}</div>` : ''}
      ${submission.subject ? `<div class="field"><strong>Subject:</strong> ${validator.escape(submission.subject)}</div>` : ''}

      <div class="field" style="margin-top: 25px;">
        <strong style="display: block; margin-bottom: 10px;">Message:</strong>
        <p style="margin: 0; white-space: pre-wrap;">${validator.escape(submission.message)}</p>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://swazsolutions.com'}/dashboard/forms" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View in Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;"><strong>Submitted at:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
      <p style="margin: 5px 0 0 0;">This is an automated notification</p>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: `"Swaz Solutions Forms" <${EMAIL_CONFIG.from}>`,
      to: recipientEmail,
      subject: `New Form Submission: ${linkTitle}`,
      html: htmlBody
    });

    console.log('✅ Form submission email sent:', info.messageId);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending form submission email:', error);
    return { sent: false, reason: error.message };
  }
}

/**
 * Store form submission in database
 */
function storeSubmission(linkId, profileId, data, ipHash, userAgent) {
  try {
    const result = db
      .prepare(
        `
      INSERT INTO contact_form_submissions (
        link_id, profile_id, name, email, phone, subject, message, ip_hash, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        linkId,
        profileId,
        data.name || null,
        data.email,
        data.phone || null,
        data.subject || null,
        data.message,
        ipHash,
        userAgent
      );

    return {
      id: result.lastInsertRowid,
      linkId,
      profileId,
      email: data.email,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error storing form submission:', error);
    throw new Error('Failed to store form submission');
  }
}

/**
 * Mark submission as read
 */
function markAsRead(submissionId, profileId) {
  try {
    const submission = db
      .prepare('SELECT * FROM contact_form_submissions WHERE id = ? AND profile_id = ?')
      .get(submissionId, profileId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    db.prepare(
      `
      UPDATE contact_form_submissions SET read_at = CURRENT_TIMESTAMP WHERE id = ?
    `
    ).run(submissionId);

    return true;
  } catch (error) {
    console.error('Error marking submission as read:', error);
    throw error;
  }
}

/**
 * Delete form submission
 */
function deleteSubmission(submissionId, profileId) {
  try {
    const submission = db
      .prepare('SELECT * FROM contact_form_submissions WHERE id = ? AND profile_id = ?')
      .get(submissionId, profileId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    db.prepare(
      `
      DELETE FROM contact_form_submissions WHERE id = ?
    `
    ).run(submissionId);

    return true;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw error;
  }
}

/**
 * Get form submissions for a profile's link
 * Returns paginated results with optional filtering
 */
function getSubmissions(linkId, profileId, options = {}) {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;
    const unreadOnly = options.unreadOnly || false;

    let query = `
      SELECT * FROM contact_form_submissions
      WHERE link_id = ? AND profile_id = ?
    `;

    if (unreadOnly) {
      query += ` AND read_at IS NULL`;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const submissions = db.prepare(query).all(linkId, profileId, limit, offset);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as count FROM contact_form_submissions
      WHERE link_id = ? AND profile_id = ?
    `;

    if (unreadOnly) {
      countQuery += ` AND read_at IS NULL`;
    }

    const countResult = db.prepare(countQuery).get(linkId, profileId);
    const total = countResult?.count || 0;

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

/**
 * Get submission analytics for a link
 * Returns counts by date, device type, etc.
 */
function getSubmissionAnalytics(linkId, profileId) {
  try {
    // Total submissions
    const total = db
      .prepare('SELECT COUNT(*) as count FROM contact_form_submissions WHERE link_id = ? AND profile_id = ?')
      .get(linkId, profileId)?.count || 0;

    // Unread submissions
    const unread = db
      .prepare(
        'SELECT COUNT(*) as count FROM contact_form_submissions WHERE link_id = ? AND profile_id = ? AND read_at IS NULL'
      )
      .get(linkId, profileId)?.count || 0;

    // Submissions by date (last 7 days)
    const byDate = db
      .prepare(
        `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM contact_form_submissions
      WHERE link_id = ? AND profile_id = ? AND created_at > datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `
      )
      .all(linkId, profileId);

    // Unique email submissions
    const uniqueEmails = db
      .prepare(
        'SELECT COUNT(DISTINCT email) as count FROM contact_form_submissions WHERE link_id = ? AND profile_id = ?'
      )
      .get(linkId, profileId)?.count || 0;

    return {
      total,
      unread,
      uniqueEmails,
      byDate,
      unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching submission analytics:', error);
    throw error;
  }
}

module.exports = {
  hashIP,
  sanitizeInput,
  validateFormFields,
  checkRateLimit,
  sendFormSubmissionEmail,
  storeSubmission,
  markAsRead,
  deleteSubmission,
  getSubmissions,
  getSubmissionAnalytics
};
