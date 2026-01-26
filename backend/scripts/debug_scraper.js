const { scrapeAllBrands } = require('../services/cameraUpdatesScraper');

async function run() {
    console.log('Starting debug scrape...');
    const updates = await scrapeAllBrands();
    if (updates) {
        console.log('Scrape complete. Found ' + updates.length + ' updates.');
    } else {
        console.log('Scrape returned null (no updates or error).');
    }
}

run();
