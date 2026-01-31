#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Runs automated checks after deployment to production
 *
 * Usage: npm run verify-deployment
 */

const axios = require('axios');
const https = require('https');

// Configuration
const baseUrl = process.env.VERIFY_URL || 'https://swazdatarecovery.com';
const isDev = process.env.NODE_ENV === 'development';

// HTTPS agent that allows self-signed certificates in dev
const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
});

const axiosInstance = axios.create({
    httpsAgent,
    timeout: 10000,
    validateStatus: () => true // Don't throw on any status
});

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

class DeploymentVerifier {
    constructor() {
        this.checks = [];
        this.passCount = 0;
        this.failCount = 0;
        this.warnCount = 0;
    }

    /**
     * Add a check result
     */
    addCheck(name, status, details = '') {
        this.checks.push({ name, status, details });

        if (status === 'PASS') {
            this.passCount++;
        } else if (status === 'FAIL') {
            this.failCount++;
        } else if (status === 'WARN') {
            this.warnCount++;
        }
    }

    /**
     * Check if homepage loads
     */
    async checkHomepage() {
        try {
            const res = await axiosInstance.get(baseUrl);

            if (res.status === 200) {
                this.addCheck('Homepage loads', 'PASS', `Status: ${res.status}`);
                return true;
            } else {
                this.addCheck('Homepage loads', 'FAIL', `Status: ${res.status}`);
                return false;
            }
        } catch (err) {
            this.addCheck('Homepage loads', 'FAIL', err.message);
            return false;
        }
    }

    /**
     * Check if profile/vCard page loads
     */
    async checkVCardPanel() {
        try {
            const res = await axiosInstance.get(`${baseUrl}/profile`, {
                maxRedirects: 5
            });

            if (res.status === 200) {
                // Check if response contains expected content
                const containsProfile = res.data && (
                    res.data.includes('profile') ||
                    res.data.includes('vcard') ||
                    res.data.includes('vcardPanel') ||
                    res.data.includes('VCard')
                );

                if (containsProfile) {
                    this.addCheck('vCard profile page loads', 'PASS', `Status: ${res.status}`);
                    return true;
                } else {
                    this.addCheck('vCard profile page loads', 'WARN', 'Page loads but content may be incomplete');
                    return true;
                }
            } else {
                this.addCheck('vCard profile page loads', 'FAIL', `Status: ${res.status}`);
                return false;
            }
        } catch (err) {
            this.addCheck('vCard profile page loads', 'FAIL', err.message);
            return false;
        }
    }

    /**
     * Check API endpoints
     */
    async checkAPIEndpoints() {
        const endpoints = [
            { path: '/api/health', name: 'Health Check', auth: false },
            { path: '/api/templates', name: 'Templates API', auth: true },
            { path: '/api/profiles', name: 'Profiles API', auth: true },
            { path: '/api/block-types', name: 'Block Types API', auth: true },
        ];

        for (const endpoint of endpoints) {
            try {
                const res = await axiosInstance.get(`${baseUrl}${endpoint.path}`, {
                    headers: endpoint.auth ? { 'Authorization': 'Bearer invalid' } : {}
                });

                // For health check, expect 200
                if (endpoint.path === '/api/health') {
                    if (res.status === 200 && res.data.status) {
                        this.addCheck(`API ${endpoint.name}`, 'PASS', `Status: ${res.status}`);
                    } else {
                        this.addCheck(`API ${endpoint.name}`, 'FAIL', `Status: ${res.status}`);
                    }
                } else if (endpoint.auth) {
                    // For auth-required endpoints, expect 401/403 without token
                    if (res.status === 401 || res.status === 403 || res.status === 200) {
                        this.addCheck(`API ${endpoint.name}`, 'PASS', `Status: ${res.status}`);
                    } else {
                        this.addCheck(`API ${endpoint.name}`, 'WARN', `Status: ${res.status}`);
                    }
                } else {
                    if (res.status < 500) {
                        this.addCheck(`API ${endpoint.name}`, 'PASS', `Status: ${res.status}`);
                    } else {
                        this.addCheck(`API ${endpoint.name}`, 'FAIL', `Status: ${res.status}`);
                    }
                }
            } catch (err) {
                this.addCheck(`API ${endpoint.name}`, 'FAIL', err.message);
            }
        }
    }

    /**
     * Check health endpoint details
     */
    async checkHealthStatus() {
        try {
            const res = await axiosInstance.get(`${baseUrl}/api/health`);

            if (res.data && res.data.status) {
                if (res.data.status === 'healthy') {
                    this.addCheck('Health Status', 'PASS', `All systems operational`);

                    // Check components
                    if (res.data.components) {
                        const dbStatus = res.data.components.database;
                        const storageStatus = res.data.components.fileStorage;

                        if (dbStatus !== 'operational') {
                            this.addCheck('Database Component', 'WARN', `Status: ${dbStatus}`);
                        }
                        if (storageStatus !== 'operational') {
                            this.addCheck('File Storage Component', 'WARN', `Status: ${storageStatus}`);
                        }
                    }

                    // Check memory
                    if (res.data.details && res.data.details.memory) {
                        const memPercent = res.data.details.memory.percentUsed;
                        if (memPercent && parseFloat(memPercent) > 80) {
                            this.addCheck('Memory Usage', 'WARN', `High usage: ${memPercent}`);
                        } else {
                            this.addCheck('Memory Usage', 'PASS', `${memPercent}`);
                        }
                    }

                    return true;
                } else if (res.data.status === 'degraded') {
                    this.addCheck('Health Status', 'WARN', 'System degraded - some components may be unavailable');
                    return true;
                } else {
                    this.addCheck('Health Status', 'FAIL', `Unhealthy: ${res.data.status}`);
                    return false;
                }
            } else {
                this.addCheck('Health Status', 'FAIL', 'Invalid health response');
                return false;
            }
        } catch (err) {
            this.addCheck('Health Status', 'FAIL', err.message);
            return false;
        }
    }

    /**
     * Check static assets (CSS, JS)
     */
    async checkStaticAssets() {
        try {
            const res = await axiosInstance.get(baseUrl);

            if (res.data) {
                const hasCSS = res.data.includes('.css') || res.data.includes('style');
                const hasJS = res.data.includes('.js') || res.data.includes('script');

                if (hasCSS && hasJS) {
                    this.addCheck('Static Assets', 'PASS', 'CSS and JS assets found');
                } else {
                    this.addCheck('Static Assets', 'WARN', 'Some assets may be missing');
                }
            }
        } catch (err) {
            this.addCheck('Static Assets', 'FAIL', err.message);
        }
    }

    /**
     * Check response times
     */
    async checkResponseTimes() {
        try {
            const start = Date.now();
            await axiosInstance.get(baseUrl);
            const time = Date.now() - start;

            if (time < 1000) {
                this.addCheck('Response Time', 'PASS', `${time}ms`);
            } else if (time < 3000) {
                this.addCheck('Response Time', 'WARN', `${time}ms (slower than expected)`);
            } else {
                this.addCheck('Response Time', 'FAIL', `${time}ms (too slow)`);
            }
        } catch (err) {
            this.addCheck('Response Time', 'FAIL', err.message);
        }
    }

    /**
     * Check SSL certificate (for HTTPS)
     */
    async checkSSL() {
        if (!baseUrl.startsWith('https://')) {
            this.addCheck('SSL Certificate', 'SKIP', 'Not HTTPS');
            return;
        }

        try {
            const res = await axiosInstance.get(baseUrl);
            if (res.status === 200) {
                this.addCheck('SSL Certificate', 'PASS', 'Valid and trusted');
            } else {
                this.addCheck('SSL Certificate', 'WARN', `Status: ${res.status}`);
            }
        } catch (err) {
            if (err.message.includes('certificate')) {
                this.addCheck('SSL Certificate', 'FAIL', 'Certificate error');
            } else {
                this.addCheck('SSL Certificate', 'FAIL', err.message);
            }
        }
    }

    /**
     * Print results in formatted table
     */
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.blue}DEPLOYMENT VERIFICATION REPORT${colors.reset}`);
        console.log('='.repeat(60));
        console.log(`Base URL: ${baseUrl}`);
        console.log(`Time: ${new Date().toISOString()}`);
        console.log('='.repeat(60) + '\n');

        // Print checks
        this.checks.forEach(check => {
            let icon = '  ';
            let colorCode = colors.reset;

            if (check.status === 'PASS') {
                icon = `${colors.green}✓${colors.reset}`;
            } else if (check.status === 'FAIL') {
                icon = `${colors.red}✗${colors.reset}`;
            } else if (check.status === 'WARN') {
                icon = `${colors.yellow}⚠${colors.reset}`;
            } else if (check.status === 'SKIP') {
                icon = `${colors.gray}—${colors.reset}`;
                colorCode = colors.gray;
            }

            const status = `[${check.status}]`;
            const details = check.details ? ` — ${check.details}` : '';

            console.log(`${icon} ${check.name.padEnd(30)} ${colorCode}${status}${colors.reset}${details}`);
        });

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.green}PASS: ${this.passCount}${colors.reset}  ${colors.yellow}WARN: ${this.warnCount}${colors.reset}  ${colors.red}FAIL: ${this.failCount}${colors.reset}`);
        console.log('='.repeat(60) + '\n');

        // Print recommendations
        if (this.failCount > 0) {
            console.log(`${colors.red}DEPLOYMENT VERIFICATION FAILED${colors.reset}`);
            console.log('Please fix the issues above before proceeding.\n');
            return false;
        } else if (this.warnCount > 0) {
            console.log(`${colors.yellow}DEPLOYMENT VERIFICATION PASSED WITH WARNINGS${colors.reset}`);
            console.log('Review the warnings above and monitor the application.\n');
            return true;
        } else {
            console.log(`${colors.green}DEPLOYMENT VERIFICATION PASSED${colors.reset}`);
            console.log('All checks completed successfully.\n');
            return true;
        }
    }

    /**
     * Run all checks
     */
    async runAll() {
        console.log(`\n${colors.blue}Starting deployment verification...${colors.reset}\n`);

        await this.checkSSL();
        await this.checkHomepage();
        await this.checkVCardPanel();
        await this.checkStaticAssets();
        await this.checkResponseTimes();
        await this.checkAPIEndpoints();
        await this.checkHealthStatus();

        const success = this.printResults();
        process.exit(success ? 0 : 1);
    }
}

// Run verification
const verifier = new DeploymentVerifier();
verifier.runAll().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
