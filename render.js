const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function render() {
    const browser = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome' });
    const context = await browser.newContext({ viewport: { width: 1200, height: 675 } });
    const page = await context.newPage();
    
    // Load local HTML file
    await page.goto('file://' + path.resolve('meme.html'));
    
    // Take screenshot
    await page.screenshot({ path: 'meme.png' });
    
    await browser.close();
    
    // Verify
    const stats = fs.statSync('meme.png');
    console.log(`Meme saved: ${stats.size} bytes`);
    if (stats.size > 1024 * 1024) {
        throw new Error('Meme size exceeds 1MB');
    }
    
    console.log('DONE');
}

render().catch(err => {
    console.error(err);
    process.exit(1);
});
