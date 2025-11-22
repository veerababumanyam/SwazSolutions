/**
 * Test script for Camera Updates Language and Content Filtering
 * Tests the new English-only filtering and feature validation
 */

const { scrapeAllBrands } = require('../services/cameraUpdatesScraper');

// Test language detection function (matches the actual implementation)
function isEnglishText(text) {
    if (!text || text.length < 10) return false;
    
    const nonEnglishChars = /[\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    if (nonEnglishChars.test(text)) return false;
    
    const englishWords = /\b(the|is|at|which|on|a|an|as|are|was|were|been|be|have|has|had|do|does|did|will|would|could|should|may|might|can|of|for|to|in|with|by|from|about|into|through|during|before|after|above|below|between|under|camera|lens|firmware|update|version|feature|photo|image|sensor|autofocus|exposure|aperture|shutter|iso|improved|enhanced|new|fixed|stability|performance|detection|tracking|recording|light|conditions)\b/gi;
    const matches = text.match(englishWords);
    const wordCount = text.split(/\s+/).length;
    const englishWordRatio = matches ? matches.length / wordCount : 0;
    
    if (englishWordRatio < 0.10) return false;
    
    const hasProperSpacing = /\b[a-zA-Z]+\s+[a-zA-Z]+\b/.test(text);
    if (!hasProperSpacing) return false;
    
    const specialCharRatio = (text.match(/[^\w\s.,!?;:()\-'"]/g) || []).length / text.length;
    if (specialCharRatio > 0.1) return false;
    
    return true;
}

// Test cases
const testCases = [
    {
        text: 'Canon EOS R5 Mark II Firmware Update 1.2.0',
        expected: true,
        description: 'Valid English camera update title'
    },
    {
        text: 'キヤノン EOS R5 ファームウェアアップデート',
        expected: false,
        description: 'Japanese text should be filtered'
    },
    {
        text: 'Sony A7 V - Professional Hybrid Camera with 45MP sensor',
        expected: true,
        description: 'Valid English camera announcement'
    },
    {
        text: 'Nikon Z9 Обновление прошивки версия 3.0',
        expected: false,
        description: 'Russian text should be filtered'
    },
    {
        text: 'Improved AF tracking in low light conditions',
        expected: true,
        description: 'Valid English feature description'
    },
    {
        text: 'test',
        expected: false,
        description: 'Too short to validate'
    }
];

console.log('🧪 Testing Language Detection Function\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
    const result = isEnglishText(testCase.text);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    
    if (result === testCase.expected) {
        passed++;
    } else {
        failed++;
    }
    
    console.log(`\n${status}: ${testCase.description}`);
    console.log(`  Input: "${testCase.text}"`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

// Live scraping test
async function testLiveScraping() {
    console.log('\n🔴 Live Scraping Test\n');
    console.log('=' .repeat(60));
    console.log('Testing camera updates scraper with new filters...\n');
    
    try {
        const updates = await scrapeAllBrands();
        
        if (!updates || updates.length === 0) {
            console.log('⚠️  No updates retrieved (this is normal if no new content is available)');
            return;
        }
        
        console.log(`\n✅ Retrieved ${updates.length} updates\n`);
        
        // Validate all updates are in English
        let allEnglish = true;
        let emptyFeatures = 0;
        let validFeatures = 0;
        
        for (const update of updates) {
            const titleEnglish = isEnglishText(update.title);
            const descEnglish = isEnglishText(update.description);
            
            if (!titleEnglish || !descEnglish) {
                allEnglish = false;
                console.log(`❌ Non-English content found:`);
                console.log(`   Title: ${update.title.substring(0, 50)}...`);
                console.log(`   Title English: ${titleEnglish}, Description English: ${descEnglish}`);
            }
            
            if (!update.features || update.features.length === 0) {
                emptyFeatures++;
            } else {
                validFeatures++;
            }
        }
        
        console.log('\n📊 Content Analysis:');
        console.log(`  ✓ All content in English: ${allEnglish ? '✅ YES' : '❌ NO'}`);
        console.log(`  ✓ Updates with features: ${validFeatures}`);
        console.log(`  ✓ Updates without features: ${emptyFeatures}`);
        
        // Show sample updates
        console.log('\n📋 Sample Updates:');
        for (let i = 0; i < Math.min(3, updates.length); i++) {
            const update = updates[i];
            console.log(`\n  ${i + 1}. ${update.brand} - ${update.title.substring(0, 60)}`);
            console.log(`     Type: ${update.type}, Features: ${update.features.length}`);
            console.log(`     Description: ${update.description.substring(0, 80)}...`);
        }
        
    } catch (error) {
        console.error('❌ Error during live scraping test:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
}

// Run tests
async function runTests() {
    // Wait a moment for output to be visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Uncomment the line below to test live scraping (may take a few minutes)
    // await testLiveScraping();
    
    console.log('\n✅ All tests completed!\n');
    console.log('💡 To test live scraping, uncomment the testLiveScraping() call in the script.\n');
}

runTests();
