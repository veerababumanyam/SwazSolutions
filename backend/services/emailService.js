const nodemailer = require('nodemailer');

/**
 * Email Service for sending ticket notifications
 * Supports multiple email providers: Gmail, SendGrid, AWS SES, SMTP
 */

// Email configuration from environment variables
const EMAIL_CONFIG = {
    service: process.env.EMAIL_SERVICE || 'smtp', // 'gmail', 'sendgrid', 'smtp'
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'info@swazdatarecovery.com', // Your email
        pass: process.env.EMAIL_PASSWORD // App password or API key
    },
    from: process.env.EMAIL_FROM || 'info@swazdatarecovery.com',
    to: process.env.EMAIL_TO || 'info@swazdatarecovery.com' // Swaz team email
};

// Create transporter based on configuration
let transporter = null;

function initializeTransporter() {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
        console.warn('⚠️  Email credentials not configured. Email notifications disabled.');
        console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env file');
        return null;
    }

    try {
        if (EMAIL_CONFIG.service === 'gmail') {
            // Gmail configuration
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: EMAIL_CONFIG.auth
            });
        } else {
            // Custom SMTP configuration (recommended for domain email)
            transporter = nodemailer.createTransport({
                host: EMAIL_CONFIG.host,
                port: EMAIL_CONFIG.port,
                secure: EMAIL_CONFIG.secure,
                auth: EMAIL_CONFIG.auth
            });
        }

        console.log('✅ Email service initialized:', EMAIL_CONFIG.service);
        return transporter;
    } catch (error) {
        console.error('❌ Failed to initialize email service:', error.message);
        return null;
    }
}

/**
 * Send ticket notification email to Swaz team
 */
async function sendTicketNotification(ticketData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        console.warn('⚠️  Email not sent - service not configured');
        return { sent: false, reason: 'Email service not configured' };
    }

    const {
        ticketId,
        name,
        email,
        phone,
        deviceType,
        symptoms,
        isEmergency,
        ipAddress,
        userAgent
    } = ticketData;

    // Prepare email content
    const subject = isEmergency
        ? `🚨 EMERGENCY TICKET ${ticketId} - ${name}`
        : `📋 New Ticket ${ticketId} - ${name}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${isEmergency ? '#ef4444' : '#3b82f6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #3b82f6; }
        .field strong { display: inline-block; width: 120px; color: #6b7280; }
        .emergency { background: #fee2e2; border-left-color: #ef4444; }
        .footer { background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">${isEmergency ? '🚨 EMERGENCY' : '📋 New'} Data Recovery Ticket</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Ticket ID: ${ticketId}</p>
        </div>
        
        <div class="content">
            ${isEmergency ? '<div class="field emergency"><strong>⚠️ PRIORITY:</strong> EMERGENCY - Requires immediate attention (15 min response time)</div>' : ''}
            
            <div class="field">
                <strong>Customer:</strong> ${name}
            </div>
            
            <div class="field">
                <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
            </div>
            
            <div class="field">
                <strong>Phone:</strong> <a href="tel:${phone}">${phone}</a>
            </div>
            
            <div class="field">
                <strong>Device Type:</strong> ${deviceType}
            </div>
            
            <div class="field">
                <strong>Symptoms:</strong><br>
                ${symptoms}
            </div>
            
            <div class="field" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>IP Address:</strong> ${ipAddress}<br>
                <strong>User Agent:</strong> ${userAgent}
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="mailto:${email}?subject=Re: ${ticketId} - Data Recovery Inquiry" class="btn">
                    📧 Reply to Customer
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>Swaz Solutions Data Recovery</strong></p>
            <p style="margin: 5px 0;">Automated notification system - Do not reply to this email</p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${isEmergency ? '🚨 EMERGENCY' : '📋 New'} Data Recovery Ticket

Ticket ID: ${ticketId}
${isEmergency ? '⚠️ PRIORITY: EMERGENCY - Requires immediate attention\n' : ''}
Customer: ${name}
Email: ${email}
Phone: ${phone}
Device Type: ${deviceType}

Symptoms:
${symptoms}

Technical Info:
IP: ${ipAddress}
User Agent: ${userAgent}

Reply to: ${email}
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz Solutions Tickets" <${EMAIL_CONFIG.from}>`,
            to: EMAIL_CONFIG.to,
            subject: subject,
            text: textContent,
            html: htmlContent,
            priority: isEmergency ? 'high' : 'normal'
        });

        console.log('✅ Email sent:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}

/**
 * Send confirmation email to customer (optional)
 */
async function sendCustomerConfirmation(ticketData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        return { sent: false, reason: 'Email service not configured' };
    }

    const { ticketId, name, email, isEmergency } = ticketData;

    const subject = `Ticket Received: ${ticketId} - Swaz Data Recovery`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🛡️ Ticket Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your data recovery request</p>
        </div>
        
        <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for contacting Swaz Solutions. Your ticket has been successfully submitted and our team has been notified.</p>
            
            <div class="highlight">
                <strong>Ticket ID:</strong> ${ticketId}<br>
                <strong>Status:</strong> Pending Review<br>
                <strong>Response Time:</strong> ${isEmergency ? '15 minutes (Emergency)' : '4-6 hours'}
            </div>
            
            <h3>What happens next?</h3>
            <ol>
                <li>Our recovery specialists will review your case</li>
                <li>We'll contact you at <strong>${email}</strong> with next steps</li>
                <li>You'll receive a free diagnostic evaluation</li>
                <li>We'll provide a detailed recovery plan and quote</li>
            </ol>
            
            <p><strong>Need immediate assistance?</strong><br>
            Call us: <a href="tel:+919701087446">+91-9701087446</a><br>
            Email: <a href="mailto:contactus@swazdatarecovery.com">contactus@swazdatarecovery.com</a></p>
        </div>
        
        <div class="footer">
            <p><strong>Swaz Solutions</strong> | Professional Data Recovery<br>
            Rajamahendravaram, Andhra Pradesh, India</p>
            <p>© 2025 Swaz Solutions. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz Solutions" <${EMAIL_CONFIG.from}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });

        console.log('✅ Confirmation email sent to customer:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Confirmation email failed:', error.message);
        // Don't throw - confirmation email is optional
        return { sent: false, error: error.message };
    }
}

/**
 * Send Agentic AI inquiry notification email to Swaz team
 */
async function sendAgenticAIInquiryNotification(inquiryData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        console.warn('⚠️  Email not sent - service not configured');
        return { sent: false, reason: 'Email service not configured' };
    }

    const {
        inquiryId,
        name,
        email,
        phone,
        company,
        companySize,
        serviceType,
        projectDescription,
        budget,
        timeline,
        priority,
        ipAddress,
        userAgent
    } = inquiryData;

    // Prepare email content
    const priorityEmoji = priority === 'high' ? '🔥' : '📋';
    const subject = `${priorityEmoji} ${priority === 'high' ? 'HIGH PRIORITY' : 'New'} AI Inquiry ${inquiryId} - ${company}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .header { background: ${priority === 'high' ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .field { margin: 15px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 6px; }
        .field strong { display: block; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .field-value { color: #1f2937; font-size: 15px; }
        .priority-high { background: #fef3c7; border-left-color: #f59e0b; }
        .project-desc { background: #f0f9ff; border-left-color: #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
        .footer { background: #1f2937; color: #d1d5db; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px; }
        .btn { display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 15px 5px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); }
        .btn:hover { background: #2563eb; }
        .btn-secondary { background: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4); }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-high { background: #fef3c7; color: #b45309; }
        .badge-normal { background: #dbeafe; color: #1e40af; }
        .stats { display: flex; gap: 15px; margin: 20px 0; }
        .stat { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
        .stat-value { font-size: 18px; font-weight: 700; color: #3b82f6; }
        .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">${priorityEmoji} Agentic AI Solution Inquiry</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">${inquiryId} • ${company}</p>
            <span class="badge ${priority === 'high' ? 'badge-high' : 'badge-normal'}">${priority.toUpperCase()} PRIORITY</span>
        </div>
        
        <div class="content">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 22px;">📊 Inquiry Overview</h2>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${serviceType}</div>
                    <div class="stat-label">Service Type</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${budget || 'TBD'}</div>
                    <div class="stat-label">Budget Range</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${timeline || 'Flexible'}</div>
                    <div class="stat-label">Timeline</div>
                </div>
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">👤 Contact Information</h3>
            
            <div class="field">
                <strong>Full Name</strong>
                <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
                <strong>Company</strong>
                <div class="field-value">${company}${companySize ? ` (${companySize})` : ''}</div>
            </div>
            
            <div class="field">
                <strong>Email Address</strong>
                <div class="field-value"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></div>
            </div>
            
            <div class="field">
                <strong>Phone Number</strong>
                <div class="field-value"><a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a></div>
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">📝 Project Details</h3>
            
            <div class="project-desc">
                <strong style="display: block; margin-bottom: 10px; color: #0369a1;">Project Description:</strong>
                ${projectDescription}
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">🔍 Technical Details</h3>
            
            <div class="field" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>IP Address</strong>
                <div class="field-value" style="font-family: monospace;">${ipAddress}</div>
            </div>
            
            <div class="field" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>User Agent</strong>
                <div class="field-value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${userAgent}</div>
            </div>

            <div style="text-align: center; margin: 30px 0; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <a href="mailto:${email}?subject=Re: ${inquiryId} - ${serviceType} Inquiry&body=Hi ${name},%0D%0A%0D%0AThank you for your interest in our Agentic AI solutions." class="btn">
                    📧 Reply to Customer
                </a>
                <a href="tel:${phone}" class="btn btn-secondary">
                    📞 Call Now
                </a>
            </div>

            ${priority === 'high' ? `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <strong style="color: #b45309; font-size: 16px;">⚠️ HIGH PRIORITY INQUIRY</strong>
                <p style="margin: 10px 0 0 0; color: #92400e;">This inquiry indicates a high-value project. Recommended response time: <strong>12-24 hours</strong></p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">Swaz Solutions - Agentic AI Division</p>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Automated inquiry notification • Do not reply to this email</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">Inquiry received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${priorityEmoji} ${priority === 'high' ? 'HIGH PRIORITY' : 'New'} Agentic AI Inquiry

Inquiry ID: ${inquiryId}
Priority: ${priority.toUpperCase()}

=== CONTACT INFORMATION ===
Name: ${name}
Company: ${company}${companySize ? ` (${companySize})` : ''}
Email: ${email}
Phone: ${phone}

=== PROJECT DETAILS ===
Service Type: ${serviceType}
Budget: ${budget || 'TBD'}
Timeline: ${timeline || 'Flexible'}

Project Description:
${projectDescription}

=== TECHNICAL INFO ===
IP: ${ipAddress}
User Agent: ${userAgent}

${priority === 'high' ? '\n⚠️ HIGH PRIORITY: Recommended response time: 12-24 hours\n' : ''}

Reply to: ${email}
Call: ${phone}
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz AI Inquiries" <${EMAIL_CONFIG.from}>`,
            to: EMAIL_CONFIG.to,
            subject: subject,
            text: textContent,
            html: htmlContent,
            priority: priority === 'high' ? 'high' : 'normal'
        });

        console.log('✅ Agentic AI inquiry email sent:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Inquiry email sending failed:', error.message);
        throw error;
    }
}

/**
 * Send confirmation email to customer for Agentic AI inquiry
 */
async function sendAgenticAICustomerConfirmation(inquiryData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        return { sent: false, reason: 'Email service not configured' };
    }

    const { inquiryId, name, email, company, serviceType, priority } = inquiryData;
    const responseTime = priority === 'high' ? '12-24 hours' : '24-48 hours';

    const subject = `Inquiry Received: ${inquiryId} - Swaz Solutions`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .footer { background: #1f2937; color: #d1d5db; padding: 25px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px; }
        .highlight { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; }
        .btn { display: inline-block; padding: 14px 28px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🤖 Inquiry Confirmed</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 16px;">We're excited to discuss your AI project</p>
        </div>
        
        <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for your interest in Swaz Solutions' Agentic AI development services. We've successfully received your inquiry for <strong>${serviceType}</strong>.</p>
            
            <div class="highlight">
                <strong>📋 Inquiry ID:</strong> ${inquiryId}<br>
                <strong>🏢 Company:</strong> ${company}<br>
                <strong>⏱️ Response Time:</strong> ${responseTime}<br>
                <strong>📍 Status:</strong> Under Review
            </div>
            
            <h3 style="color: #1f2937;">What happens next?</h3>
            <ol style="padding-left: 20px;">
                <li style="margin: 10px 0;">Our AI solutions architects will review your project requirements</li>
                <li style="margin: 10px 0;">We'll schedule a free consultation to discuss your use case in detail</li>
                <li style="margin: 10px 0;">You'll receive a tailored proposal with architecture, timeline, and pricing</li>
                <li style="margin: 10px 0;">We can sign an NDA before discussing proprietary information</li>
            </ol>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
                <h4 style="margin-top: 0; color: #0c4a6e;">📞 Need faster response?</h4>
                <p style="margin: 10px 0 5px 0;">Call us directly:</p>
                <p style="margin: 5px 0;"><strong style="font-size: 18px; color: #0284c7;">+91-9701087446</strong></p>
                <p style="margin: 10px 0 5px 0;">Email:</p>
                <p style="margin: 5px 0;"><a href="mailto:info@swazsolutions.com" style="color: #0284c7;">info@swazsolutions.com</a></p>
            </div>

            <p style="margin-top: 30px;">We look forward to helping you build cutting-edge AI agents that transform your business.</p>
            
            <p>Best regards,<br>
            <strong>The Swaz Solutions Team</strong><br>
            Agentic AI Division</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">Swaz Solutions</p>
            <p style="margin: 10px 0;">Enterprise Agentic AI Development</p>
            <p style="margin: 15px 0 5px 0; opacity: 0.8;">Rajamahendravaram, Andhra Pradesh, India</p>
            <p style="margin: 5px 0;">© 2025 Swaz Solutions. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz Solutions" <${EMAIL_CONFIG.from}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });

        console.log('✅ AI inquiry confirmation sent to customer:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ AI confirmation email failed:', error.message);
        return { sent: false, error: error.message };
    }
}

/**
 * Send general inquiry notification email to Swaz team
 */
async function sendGeneralInquiryNotification(inquiryData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        console.warn('⚠️  Email not sent - service not configured');
        return { sent: false, reason: 'Email service not configured' };
    }

    const {
        inquiryId,
        name,
        email,
        subject,
        message,
        ipAddress,
        userAgent
    } = inquiryData;

    const emailSubject = `📬 New Inquiry ${inquiryId} - ${subject}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .field { margin: 15px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #10b981; border-radius: 6px; }
        .field strong { display: block; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .field-value { color: #1f2937; font-size: 15px; }
        .message-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
        .footer { background: #1f2937; color: #d1d5db; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px; }
        .btn { display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 15px 5px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4); }
        .btn:hover { background: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">📬 New General Inquiry</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">${inquiryId}</p>
        </div>

        <div class="content">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 22px;">📋 Inquiry Details</h2>

            <div class="field">
                <strong>Subject</strong>
                <div class="field-value" style="font-size: 18px; color: #059669;">${subject}</div>
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">👤 Contact Information</h3>

            <div class="field">
                <strong>Full Name</strong>
                <div class="field-value">${name}</div>
            </div>

            <div class="field">
                <strong>Email Address</strong>
                <div class="field-value"><a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a></div>
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">💬 Message</h3>

            <div class="message-box">
                ${message}
            </div>

            <h3 style="color: #1f2937; margin-top: 30px;">🔍 Technical Details</h3>

            <div class="field" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>IP Address</strong>
                <div class="field-value" style="font-family: monospace;">${ipAddress}</div>
            </div>

            <div class="field" style="background: #fef3c7; border-left-color: #f59e0b;">
                <strong>User Agent</strong>
                <div class="field-value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${userAgent}</div>
            </div>

            <div style="text-align: center; margin: 30px 0; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <a href="mailto:${email}?subject=Re: ${inquiryId} - ${subject}" class="btn">
                    📧 Reply to Customer
                </a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">Swaz Solutions</p>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Automated inquiry notification • Do not reply to this email</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">Inquiry received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
📬 New General Inquiry

Inquiry ID: ${inquiryId}

=== CONTACT INFORMATION ===
Name: ${name}
Email: ${email}

=== SUBJECT ===
${subject}

=== MESSAGE ===
${message}

=== TECHNICAL INFO ===
IP: ${ipAddress}
User Agent: ${userAgent}

Reply to: ${email}
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz Solutions Inquiries" <${EMAIL_CONFIG.from}>`,
            to: EMAIL_CONFIG.to,
            subject: emailSubject,
            text: textContent,
            html: htmlContent
        });

        console.log('✅ General inquiry email sent:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ General inquiry email sending failed:', error.message);
        throw error;
    }
}

/**
 * Send confirmation email to customer for general inquiry
 */
async function sendGeneralInquiryCustomerConfirmation(inquiryData) {
    const transport = transporter || initializeTransporter();

    if (!transport) {
        return { sent: false, reason: 'Email service not configured' };
    }

    const { inquiryId, name, email, subject } = inquiryData;

    const emailSubject = `Message Received: ${inquiryId} - Swaz Solutions`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .footer { background: #1f2937; color: #d1d5db; padding: 25px; border-radius: 0 0 12px 12px; text-align: center; font-size: 13px; }
        .highlight { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px;">✅ Message Received</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 16px;">Thank you for contacting us</p>
        </div>

        <div class="content">
            <p>Dear ${name},</p>

            <p>Thank you for reaching out to Swaz Solutions. We've successfully received your message regarding <strong>"${subject}"</strong>.</p>

            <div class="highlight">
                <strong>📋 Reference ID:</strong> ${inquiryId}<br>
                <strong>⏱️ Response Time:</strong> 24-48 hours<br>
                <strong>📍 Status:</strong> Under Review
            </div>

            <h3 style="color: #1f2937;">What happens next?</h3>
            <ol style="padding-left: 20px;">
                <li style="margin: 10px 0;">Our team will review your inquiry</li>
                <li style="margin: 10px 0;">We'll respond to <strong>${email}</strong> with a personalized answer</li>
                <li style="margin: 10px 0;">If needed, we may reach out for additional details</li>
            </ol>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
                <h4 style="margin-top: 0; color: #0c4a6e;">📞 Need faster assistance?</h4>
                <p style="margin: 10px 0 5px 0;">Call us directly:</p>
                <p style="margin: 5px 0;"><strong style="font-size: 18px; color: #0284c7;">+91-9701087446</strong></p>
                <p style="margin: 10px 0 5px 0;">Email:</p>
                <p style="margin: 5px 0;"><a href="mailto:info@swazsolutions.com" style="color: #0284c7;">info@swazsolutions.com</a></p>
            </div>

            <p style="margin-top: 30px;">We appreciate you taking the time to reach out and look forward to assisting you.</p>

            <p>Best regards,<br>
            <strong>The Swaz Solutions Team</strong></p>
        </div>

        <div class="footer">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">Swaz Solutions</p>
            <p style="margin: 10px 0;">Professional Technology Services</p>
            <p style="margin: 15px 0 5px 0; opacity: 0.8;">Rajamahendravaram, Andhra Pradesh, India</p>
            <p style="margin: 5px 0;">© 2025 Swaz Solutions. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const info = await transport.sendMail({
            from: `"Swaz Solutions" <${EMAIL_CONFIG.from}>`,
            to: email,
            subject: emailSubject,
            html: htmlContent
        });

        console.log('✅ General inquiry confirmation sent to customer:', info.messageId);
        return { sent: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ General inquiry confirmation email failed:', error.message);
        return { sent: false, error: error.message };
    }
}

module.exports = {
    sendTicketNotification,
    sendCustomerConfirmation,
    sendAgenticAIInquiryNotification,
    sendAgenticAICustomerConfirmation,
    sendGeneralInquiryNotification,
    sendGeneralInquiryCustomerConfirmation
};
