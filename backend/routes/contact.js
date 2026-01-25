const express = require('express');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const encryption = require('../services/encryptionService');

// Fields to encrypt for contact tickets
const TICKET_ENCRYPTED_FIELDS = ['name', 'email', 'phone', 'symptoms'];

// Fields to encrypt for AI inquiries
const AI_INQUIRY_ENCRYPTED_FIELDS = ['name', 'email', 'phone', 'company', 'projectDescription', 'projectRequirements'];

// Fields to encrypt for general inquiries
const GENERAL_INQUIRY_ENCRYPTED_FIELDS = ['name', 'email', 'subject', 'message'];

/**
 * Contact/Ticket Submission Route
 * Handles data recovery ticket submissions with spam protection
 * All PII is encrypted at rest using AES-256-GCM
 */
function createContactRoutes(db) {
    const router = express.Router();

    // Aggressive rate limiting for contact form (5 submissions per hour per IP)
    const contactLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5,
        message: { 
            error: 'Too many ticket submissions. Please wait before submitting again.',
            retryAfter: '1 hour'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false // Count all attempts, not just successful ones
    });

    // Stricter rate limit for initial validation (prevents spam bots)
    const validationLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 10,
        message: { error: 'Too many requests. Please slow down.' },
        standardHeaders: true,
        legacyHeaders: false,
    });

    /**
     * POST /api/contact/submit-ticket
     * Submit a new data recovery ticket
     */
    router.post('/submit-ticket', contactLimiter, validationLimiter, async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                deviceType,
                symptoms,
                isEmergency,
                honeypot, // Hidden field to catch bots
                timestamp // Client timestamp for validation
            } = req.body;

            // 1. HONEYPOT CHECK - Bot Detection
            if (honeypot && honeypot.length > 0) {
                console.log('🤖 Bot detected via honeypot:', req.ip);
                // Return success to bot but don't process
                return res.status(200).json({ 
                    success: true, 
                    message: 'Ticket submitted successfully',
                    ticketId: 'FAKE-' + Date.now()
                });
            }

            // 2. TIMING CHECK - Prevent automated submissions
            const submissionTime = Date.now();
            const clientTimestamp = parseInt(timestamp) || submissionTime;
            const timeDiff = Math.abs(submissionTime - clientTimestamp);
            
            // If form submitted in less than 2 seconds or timestamp is way off, likely a bot
            if (timeDiff < 2000 || timeDiff > 300000) { // 2 sec to 5 min
                console.log('⚠️  Suspicious timing detected:', req.ip, timeDiff);
                // Still process but flag for review
            }

            // 3. VALIDATION - Strict input validation
            const errors = [];

            if (!name || name.trim().length < 2 || name.length > 100) {
                errors.push('Invalid name. Must be 2-100 characters.');
            }

            if (!email || !validator.isEmail(email)) {
                errors.push('Invalid email address.');
            }

            if (!phone || !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
                errors.push('Invalid phone number.');
            }

            if (!deviceType || deviceType.length < 3) {
                errors.push('Device type is required.');
            }

            if (!symptoms || symptoms.trim().length < 10 || symptoms.length > 1000) {
                errors.push('Symptoms description must be 10-1000 characters.');
            }

            // Check for spam patterns in text fields
            const spamPatterns = [
                /viagra|cialis|casino|lottery|prize/gi,
                /(http|https):\/\/[^\s]+/gi, // URLs in symptoms
                /(.)\1{10,}/gi, // Repeated characters (aaaaaaaaaa)
            ];

            const combinedText = `${name} ${symptoms}`;
            for (const pattern of spamPatterns) {
                if (pattern.test(combinedText)) {
                    errors.push('Suspicious content detected.');
                    console.log('🚫 Spam pattern detected:', req.ip);
                    break;
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    errors 
                });
            }

            // 4. DUPLICATE CHECK - Prevent duplicate submissions
            // Use email hash for searching encrypted data
            const emailHash = encryption.hashForSearch(email);
            const recentSubmission = db.prepare(`
                SELECT id, created_at
                FROM contact_tickets
                WHERE email_hash = ?
                AND created_at > datetime('now', '-1 hour')
                ORDER BY created_at DESC
                LIMIT 1
            `).get(emailHash);

            if (recentSubmission) {
                const minutesAgo = Math.floor((Date.now() - new Date(recentSubmission.created_at).getTime()) / 60000);
                return res.status(429).json({ 
                    error: 'Duplicate submission detected',
                    message: `You submitted a ticket ${minutesAgo} minutes ago. Please wait before submitting again.`,
                    existingTicketId: `TICK-${recentSubmission.id}`
                });
            }

            // 5. SANITIZE DATA
            const sanitizedData = {
                name: validator.escape(name.trim()),
                email: validator.normalizeEmail(email.toLowerCase()),
                phone: phone.replace(/[^\d+\-() ]/g, ''),
                deviceType: validator.escape(deviceType.trim()),
                symptoms: validator.escape(symptoms.trim()),
                isEmergency: Boolean(isEmergency),
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent') || 'Unknown'
            };

            // 6. ENCRYPT SENSITIVE DATA before storage
            const encryptedData = {
                name: encryption.encrypt(sanitizedData.name),
                email: encryption.encrypt(sanitizedData.email),
                phone: encryption.encrypt(sanitizedData.phone),
                symptoms: encryption.encrypt(sanitizedData.symptoms),
                emailHash: emailHash // Store hash for searching
            };

            // 7. INSERT INTO DATABASE with encrypted data
            const insertStmt = db.prepare(`
                INSERT INTO contact_tickets (
                    name, email, email_hash, phone, device_type, symptoms,
                    is_emergency, ip_address, user_agent, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertStmt.run(
                encryptedData.name,
                encryptedData.email,
                encryptedData.emailHash,
                encryptedData.phone,
                sanitizedData.deviceType,
                encryptedData.symptoms,
                sanitizedData.isEmergency ? 1 : 0,
                sanitizedData.ipAddress,
                sanitizedData.userAgent,
                'pending' // Initial status
            );

            const ticketId = `TICK-${result.lastInsertRowid}`;

            // 8. SEND EMAIL NOTIFICATIONS
            // Note: Email sending is handled by a separate service
            // This allows for async processing and better error handling
            try {
                const emailService = require('../services/emailService');
                // Send notification to team
                await emailService.sendTicketNotification({
                    ticketId,
                    ...sanitizedData
                });
                // Send confirmation to customer
                await emailService.sendCustomerConfirmation({
                    ticketId,
                    ...sanitizedData
                });
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
                // Don't fail the request if email fails - ticket is still created
            }

            // 9. SUCCESS RESPONSE
            console.log(`✅ New ticket created: ${ticketId} from ${sanitizedData.email}`);
            
            res.status(201).json({
                success: true,
                message: sanitizedData.isEmergency 
                    ? 'Emergency ticket submitted! Our team will contact you within 15 minutes.'
                    : 'Ticket submitted successfully! We\'ll review and contact you within 4-6 hours.',
                ticketId,
                estimatedResponseTime: sanitizedData.isEmergency ? '15 minutes' : '4-6 hours'
            });

        } catch (error) {
            console.error('❌ Contact submission error:', error);
            res.status(500).json({ 
                error: 'Failed to submit ticket',
                message: 'Please try again or contact us directly at support@swazdatarecovery.com'
            });
        }
    });

    /**
     * GET /api/contact/ticket/:id
     * Check ticket status (optional feature)
     */
    router.get('/ticket/:id', validationLimiter, (req, res) => {
        try {
            const ticketId = req.params.id.replace('TICK-', '');
            
            if (!/^\d+$/.test(ticketId)) {
                return res.status(400).json({ error: 'Invalid ticket ID' });
            }

            const ticket = db.prepare(`
                SELECT
                    id,
                    name,
                    email,
                    device_type,
                    is_emergency,
                    status,
                    created_at,
                    updated_at
                FROM contact_tickets
                WHERE id = ?
            `).get(parseInt(ticketId));

            if (!ticket) {
                return res.status(404).json({ error: 'Ticket not found' });
            }

            // Note: We don't decrypt sensitive info for public status checks
            // Only return non-sensitive status info
            res.json({
                ticketId: `TICK-${ticket.id}`,
                status: ticket.status,
                createdAt: ticket.created_at,
                isEmergency: Boolean(ticket.is_emergency),
                // Sensitive info (name, email, phone, symptoms) is encrypted and not exposed here
            });

        } catch (error) {
            console.error('❌ Ticket lookup error:', error);
            res.status(500).json({ error: 'Failed to retrieve ticket' });
        }
    });

    /**
     * POST /api/contact/agentic-ai-inquiry
     * Submit an Agentic AI solutions inquiry
     */
    router.post('/agentic-ai-inquiry', contactLimiter, validationLimiter, async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                company,
                companySize,
                teamSize,
                serviceType,
                projectDescription,
                projectRequirements,
                budget,
                timeline,
                honeypot,
                timestamp
            } = req.body;

            // 1. HONEYPOT CHECK - Bot Detection
            if (honeypot && honeypot.length > 0) {
                console.log('🤖 Bot detected via honeypot:', req.ip);
                return res.status(200).json({ 
                    success: true, 
                    message: 'Inquiry submitted successfully',
                    inquiryId: 'FAKE-' + Date.now()
                });
            }

            // 2. TIMING CHECK - Prevent automated submissions
            const submissionTime = Date.now();
            const clientTimestamp = parseInt(timestamp) || submissionTime;
            const timeDiff = Math.abs(submissionTime - clientTimestamp);
            
            if (timeDiff < 3000 || timeDiff > 300000) {
                console.log('⚠️  Suspicious timing detected:', req.ip, timeDiff);
            }

            // 3. VALIDATION - Strict input validation
            const errors = [];

            if (!name || name.trim().length < 2 || name.length > 100) {
                errors.push('Invalid name. Must be 2-100 characters.');
            }

            if (!email || !validator.isEmail(email)) {
                errors.push('Invalid email address.');
            }

            if (!phone || !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
                errors.push('Invalid phone number.');
            }

            if (!company || company.trim().length < 2 || company.length > 200) {
                errors.push('Invalid company name.');
            }

            if (!serviceType || serviceType.length < 3) {
                errors.push('Service type is required.');
            }

            if (!projectDescription || projectDescription.trim().length < 20 || projectDescription.length > 2000) {
                errors.push('Project description must be 20-2000 characters.');
            }

            if (!teamSize) {
                errors.push('Technical team size is required.');
            }

            // Check for spam patterns
            const spamPatterns = [
                /viagra|cialis|casino|lottery|prize|crypto|forex/gi,
                /(http|https):\/\/[^\s]+/gi,
                /(.)\1{10,}/gi,
            ];

            const combinedText = `${name} ${company} ${projectDescription}`;
            for (const pattern of spamPatterns) {
                if (pattern.test(combinedText)) {
                    errors.push('Suspicious content detected.');
                    console.log('🚫 Spam pattern detected:', req.ip);
                    break;
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({ 
                    error: 'Validation failed', 
                    errors 
                });
            }

            // 4. DUPLICATE CHECK - Prevent duplicate submissions
            // Use email hash for searching encrypted data
            const emailHash = encryption.hashForSearch(email);
            const recentInquiry = db.prepare(`
                SELECT id, created_at
                FROM agentic_ai_inquiries
                WHERE email_hash = ?
                AND created_at > datetime('now', '-24 hours')
                ORDER BY created_at DESC
                LIMIT 1
            `).get(emailHash);

            if (recentInquiry) {
                const hoursAgo = Math.floor((Date.now() - new Date(recentInquiry.created_at).getTime()) / 3600000);
                return res.status(429).json({
                    error: 'Duplicate submission detected',
                    message: `You submitted an inquiry ${hoursAgo} hours ago. Our team will contact you within 24 hours.`,
                    existingInquiryId: `AI-INQ-${recentInquiry.id}`
                });
            }

            // 5. SANITIZE DATA
            const sanitizedData = {
                name: validator.escape(name.trim()),
                email: validator.normalizeEmail(email.toLowerCase()),
                phone: phone.replace(/[^\d+\-() ]/g, ''),
                company: validator.escape(company.trim()),
                companySize: companySize ? validator.escape(companySize) : null,
                teamSize: validator.escape(teamSize.trim()),
                serviceType: validator.escape(serviceType.trim()),
                projectDescription: validator.escape(projectDescription.trim()),
                projectRequirements: projectRequirements ? validator.escape(projectRequirements.trim()) : null,
                budget: budget ? validator.escape(budget) : null,
                timeline: timeline ? validator.escape(timeline) : null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent') || 'Unknown'
            };

            // Determine priority based on budget and timeline
            let priority = 'normal';
            if (budget && (budget.includes('$250k+') || budget.includes('$100k-$250k'))) {
                priority = 'high';
            }
            if (timeline === 'asap') {
                priority = 'high';
            }

            // 6. ENCRYPT SENSITIVE DATA before storage
            const encryptedData = {
                name: encryption.encrypt(sanitizedData.name),
                email: encryption.encrypt(sanitizedData.email),
                phone: encryption.encrypt(sanitizedData.phone),
                company: encryption.encrypt(sanitizedData.company),
                projectDescription: encryption.encrypt(sanitizedData.projectDescription),
                projectRequirements: sanitizedData.projectRequirements ? encryption.encrypt(sanitizedData.projectRequirements) : null,
                emailHash: emailHash
            };

            // 7. INSERT INTO DATABASE with encrypted data
            const insertStmt = db.prepare(`
                INSERT INTO agentic_ai_inquiries (
                    name, email, email_hash, phone, company, company_size, team_size,
                    service_type, project_description, project_requirements, budget, timeline,
                    ip_address, user_agent, status, priority
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertStmt.run(
                encryptedData.name,
                encryptedData.email,
                encryptedData.emailHash,
                encryptedData.phone,
                encryptedData.company,
                sanitizedData.companySize,
                sanitizedData.teamSize,
                sanitizedData.serviceType,
                encryptedData.projectDescription,
                encryptedData.projectRequirements,
                sanitizedData.budget,
                sanitizedData.timeline,
                sanitizedData.ipAddress,
                sanitizedData.userAgent,
                'new',
                priority
            );

            const inquiryId = `AI-INQ-${result.lastInsertRowid}`;

            // 8. SEND EMAIL NOTIFICATIONS
            try {
                const emailService = require('../services/emailService');
                // Send notification to team
                await emailService.sendAgenticAIInquiryNotification({
                    inquiryId,
                    ...sanitizedData,
                    priority
                });
                // Send confirmation to customer
                await emailService.sendAgenticAICustomerConfirmation({
                    inquiryId,
                    ...sanitizedData,
                    priority
                });
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
                // Don't fail the request if email fails
            }

            // 9. SUCCESS RESPONSE
            console.log(`✅ New AI inquiry: ${inquiryId} from ${sanitizedData.company} (${sanitizedData.email})`);
            
            const responseTime = priority === 'high' ? '12-24 hours' : '24-48 hours';
            
            res.status(201).json({
                success: true,
                message: `Thank you for your interest! Our team will review your ${sanitizedData.serviceType} inquiry and contact you within ${responseTime}.`,
                inquiryId,
                estimatedResponseTime: responseTime,
                priority
            });

        } catch (error) {
            console.error('❌ Agentic AI inquiry submission error:', error);
            res.status(500).json({ 
                error: 'Failed to submit inquiry',
                message: 'Please try again or contact us directly at +91-9701087446 or info@swazsolutions.com'
            });
        }
    });

    /**
     * POST /api/contact/general-inquiry
     * Submit a general contact inquiry
     */
    router.post('/general-inquiry', contactLimiter, validationLimiter, async (req, res) => {
        try {
            const {
                name,
                email,
                subject,
                message,
                honeypot,
                timestamp
            } = req.body;

            // 1. HONEYPOT CHECK - Bot Detection
            if (honeypot && honeypot.length > 0) {
                console.log('🤖 Bot detected via honeypot:', req.ip);
                return res.status(200).json({
                    success: true,
                    message: 'Message sent successfully',
                    inquiryId: 'FAKE-' + Date.now()
                });
            }

            // 2. TIMING CHECK - Prevent automated submissions
            const submissionTime = Date.now();
            const clientTimestamp = parseInt(timestamp) || submissionTime;
            const timeDiff = Math.abs(submissionTime - clientTimestamp);

            if (timeDiff < 2000 || timeDiff > 300000) {
                console.log('⚠️  Suspicious timing detected:', req.ip, timeDiff);
            }

            // 3. VALIDATION - Strict input validation
            const errors = [];

            if (!name || name.trim().length < 2 || name.length > 100) {
                errors.push('Invalid name. Must be 2-100 characters.');
            }

            if (!email || !validator.isEmail(email)) {
                errors.push('Invalid email address.');
            }

            if (!subject || subject.trim().length < 3 || subject.length > 200) {
                errors.push('Subject must be 3-200 characters.');
            }

            if (!message || message.trim().length < 10 || message.length > 2000) {
                errors.push('Message must be 10-2000 characters.');
            }

            // Check for spam patterns
            const spamPatterns = [
                /viagra|cialis|casino|lottery|prize|crypto|forex/gi,
                /(http|https):\/\/[^\s]+/gi,
                /(.)\1{10,}/gi,
            ];

            const combinedText = `${name} ${subject} ${message}`;
            for (const pattern of spamPatterns) {
                if (pattern.test(combinedText)) {
                    errors.push('Suspicious content detected.');
                    console.log('🚫 Spam pattern detected:', req.ip);
                    break;
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    error: 'Validation failed',
                    errors
                });
            }

            // 4. DUPLICATE CHECK - Prevent duplicate submissions
            // Use email hash for searching encrypted data
            const emailHash = encryption.hashForSearch(email);
            const recentInquiry = db.prepare(`
                SELECT id, created_at
                FROM general_inquiries
                WHERE email_hash = ?
                AND created_at > datetime('now', '-1 hour')
                ORDER BY created_at DESC
                LIMIT 1
            `).get(emailHash);

            if (recentInquiry) {
                const minutesAgo = Math.floor((Date.now() - new Date(recentInquiry.created_at).getTime()) / 60000);
                return res.status(429).json({
                    error: 'Duplicate submission detected',
                    message: `You sent a message ${minutesAgo} minutes ago. Please wait before sending another.`,
                    existingInquiryId: `GEN-INQ-${recentInquiry.id}`
                });
            }

            // 5. SANITIZE DATA
            const sanitizedData = {
                name: validator.escape(name.trim()),
                email: validator.normalizeEmail(email.toLowerCase()),
                subject: validator.escape(subject.trim()),
                message: validator.escape(message.trim()),
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent') || 'Unknown'
            };

            // 6. ENCRYPT SENSITIVE DATA before storage
            const encryptedData = {
                name: encryption.encrypt(sanitizedData.name),
                email: encryption.encrypt(sanitizedData.email),
                subject: encryption.encrypt(sanitizedData.subject),
                message: encryption.encrypt(sanitizedData.message),
                emailHash: emailHash
            };

            // 7. INSERT INTO DATABASE with encrypted data
            const insertStmt = db.prepare(`
                INSERT INTO general_inquiries (
                    name, email, email_hash, subject, message,
                    ip_address, user_agent, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertStmt.run(
                encryptedData.name,
                encryptedData.email,
                encryptedData.emailHash,
                encryptedData.subject,
                encryptedData.message,
                sanitizedData.ipAddress,
                sanitizedData.userAgent,
                'new'
            );

            const inquiryId = `GEN-INQ-${result.lastInsertRowid}`;

            // 8. SEND EMAIL NOTIFICATIONS
            try {
                const emailService = require('../services/emailService');
                // Send notification to team
                await emailService.sendGeneralInquiryNotification({
                    inquiryId,
                    ...sanitizedData
                });
                // Send confirmation to customer
                await emailService.sendGeneralInquiryCustomerConfirmation({
                    inquiryId,
                    ...sanitizedData
                });
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
                // Don't fail the request if email fails
            }

            // 9. SUCCESS RESPONSE
            console.log(`✅ New general inquiry: ${inquiryId} from ${sanitizedData.email}`);

            res.status(201).json({
                success: true,
                message: 'Thank you for reaching out! We\'ll review your message and get back to you within 24-48 hours.',
                inquiryId,
                estimatedResponseTime: '24-48 hours'
            });

        } catch (error) {
            console.error('❌ General inquiry submission error:', error);
            res.status(500).json({
                error: 'Failed to submit message',
                message: 'Please try again or contact us directly at info@swazsolutions.com'
            });
        }
    });

    return router;
}

module.exports = createContactRoutes;
