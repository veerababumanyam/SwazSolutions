// API endpoint to serve font options to frontend
const express = require('express');
const router = express.Router();
const { FONT_OPTIONS } = require('../data/theme-definitions');

/**
 * GET /api/fonts
 * Returns all available font options grouped by category
 */
router.get('/', (req, res) => {
    try {
        // Group fonts by category
        const groupedFonts = {
            modern: FONT_OPTIONS.filter(f => f.category === 'modern'),
            telugu: FONT_OPTIONS.filter(f => f.category === 'telugu'),
            tamil: FONT_OPTIONS.filter(f => f.category === 'tamil'),
            kannada: FONT_OPTIONS.filter(f => f.category === 'kannada'),
            malayalam: FONT_OPTIONS.filter(f => f.category === 'malayalam'),
            hindi: FONT_OPTIONS.filter(f => f.category === 'hindi'),
        };

        res.json({
            fonts: FONT_OPTIONS,
            groupedFonts,
            categories: [
                { id: 'modern', label: 'Modern Fonts', count: groupedFonts.modern.length },
                { id: 'telugu', label: 'Telugu', count: groupedFonts.telugu.length },
                { id: 'tamil', label: 'Tamil', count: groupedFonts.tamil.length },
                { id: 'kannada', label: 'Kannada', count: groupedFonts.kannada.length },
                { id: 'malayalam', label: 'Malayalam', count: groupedFonts.malayalam.length },
                { id: 'hindi', label: 'Hindi', count: groupedFonts.hindi.length },
            ]
        });
    } catch (error) {
        console.error('Error fetching fonts:', error);
        res.status(500).json({ error: 'Failed to fetch fonts' });
    }
});

/**
 * GET /api/fonts/:category
 * Returns fonts for a specific category
 */
router.get('/:category', (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['modern', 'telugu', 'tamil', 'kannada', 'malayalam', 'hindi'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        const fonts = FONT_OPTIONS.filter(f => f.category === category);
        res.json({ category, fonts });
    } catch (error) {
        console.error('Error fetching fonts by category:', error);
        res.status(500).json({ error: 'Failed to fetch fonts' });
    }
});

module.exports = router;
