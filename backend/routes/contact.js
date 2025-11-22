const express = require('express');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

/**
 * Contact/Ticket Submission Route
 * Handles data recovery ticket submissions with spam protection
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
        skipSuccessfulRequests: false, // Count all attempts, not just successful ones
        // Use IP-based rate limiting
        keyGenerator: (req) => {
            return req.ip || req.connection.remoteAddress;
        }
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
            const recentSubmission = db.prepare(`
                SELECT id, created_at 
                FROM contact_tickets 
                WHERE email = ? 
                AND created_at > datetime('now', '-1 hour')
                ORDER BY created_at DESC 
                LIMIT 1
            `).get(email.toLowerCase());

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

            // 6. INSERT INTO DATABASE
            const insertStmt = db.prepare(`
                INSERT INTO contact_tickets (
                    name, email, phone, device_type, symptoms, 
                    is_emergency, ip_address, user_agent, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertStmt.run(
                sanitizedData.name,
                sanitizedData.email,
                sanitizedData.phone,
                sanitizedData.deviceType,
                sanitizedData.symptoms,
                sanitizedData.isEmergency ? 1 : 0,
                sanitizedData.ipAddress,
                sanitizedData.userAgent,
                'pending' // Initial status
            );

            const ticketId = `TICK-${result.lastInsertRowid}`;

            // 7. SEND EMAIL NOTIFICATION
            // Note: Email sending is handled by a separate service
            // This allows for async processing and better error handling
            try {
                const emailService = require('../services/emailService');
                await emailService.sendTicketNotification({
                    ticketId,
                    ...sanitizedData
                });
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
                // Don't fail the request if email fails - ticket is still created
            }

            // 8. SUCCESS RESPONSE
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

            res.json({
                ticketId: `TICK-${ticket.id}`,
                status: ticket.status,
                createdAt: ticket.created_at,
                isEmergency: Boolean(ticket.is_emergency),
                // Don't expose sensitive info
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
                serviceType,
                projectDescription,
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
            const recentInquiry = db.prepare(`
                SELECT id, created_at 
                FROM agentic_ai_inquiries 
                WHERE email = ? 
                AND created_at > datetime('now', '-24 hours')
                ORDER BY created_at DESC 
                LIMIT 1
            `).get(email.toLowerCase());

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
                serviceType: validator.escape(serviceType.trim()),
                projectDescription: validator.escape(projectDescription.trim()),
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

            // 6. INSERT INTO DATABASE
            const insertStmt = db.prepare(`
                INSERT INTO agentic_ai_inquiries (
                    name, email, phone, company, company_size,
                    service_type, project_description, budget, timeline,
                    ip_address, user_agent, status, priority
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const result = insertStmt.run(
                sanitizedData.name,
                sanitizedData.email,
                sanitizedData.phone,
                sanitizedData.company,
                sanitizedData.companySize,
                sanitizedData.serviceType,
                sanitizedData.projectDescription,
                sanitizedData.budget,
                sanitizedData.timeline,
                sanitizedData.ipAddress,
                sanitizedData.userAgent,
                'new',
                priority
            );

            const inquiryId = `AI-INQ-${result.lastInsertRowid}`;

            // 7. SEND EMAIL NOTIFICATION
            try {
                const emailService = require('../services/emailService');
                await emailService.sendAgenticAIInquiryNotification({
                    inquiryId,
                    ...sanitizedData,
                    priority
                });
            } catch (emailError) {
                console.error('❌ Email notification failed:', emailError);
                // Don't fail the request if email fails
            }

            // 8. SUCCESS RESPONSE
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

    return router;
}

module.exports = createContactRoutes;
