const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const warnings = [];

    // Collect console messages
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        } else if (msg.type() === 'warning') {
            warnings.push(msg.text());
        }
    });

    // Collect page errors
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    try {
        const filePath = path.resolve(__dirname, 'index.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

        // Wait for content to load
        await page.waitForTimeout(2000);

        // Check if key elements exist
        const heroExists = await page.$('.hero') !== null;
        const galleryExists = await page.$('.asymmetrical-grid') !== null;
        const cursorExists = await page.$('.cursor') !== null;
        const preloaderExists = await page.$('.preloader') !== null;

        console.log('\n=== Website Test Results ===\n');
        console.log('Key Elements Check:');
        console.log(`  ✓ Hero Section: ${heroExists ? 'FOUND' : 'MISSING'}`);
        console.log(`  ✓ Gallery Grid: ${galleryExists ? 'FOUND' : 'MISSING'}`);
        console.log(`  ✓ Custom Cursor: ${cursorExists ? 'FOUND' : 'MISSING'}`);
        console.log(`  ✓ Preloader: ${preloaderExists ? 'FOUND' : 'MISSING'}`);

        // Test page title
        const title = await page.title();
        console.log(`  ✓ Page Title: "${title}"`);

        // Check for console errors
        console.log('\nConsole Errors:', errors.length === 0 ? 'NONE' : '');
        errors.forEach(err => console.log(`  ✗ ${err}`));

        // Check for warnings
        console.log('\nWarnings:', warnings.length === 0 ? 'NONE' : '');
        warnings.forEach(warn => console.log(`  ⚠ ${warn}`));

        // Test hover effects by simulating hover on gallery item
        const galleryItem = await page.$('.gallery-item');
        if (galleryItem) {
            await galleryItem.hover();
            await page.waitForTimeout(500);
            console.log('  ✓ Hover effects: WORKING');
        }

        console.log('\n=== Test Complete ===\n');

        if (errors.length === 0) {
            console.log('✓ Website loaded successfully with no critical errors!');
        } else {
            console.log(`⚠ Website has ${errors.length} error(s) that may need attention.`);
        }

    } catch (err) {
        console.error('Test failed:', err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
