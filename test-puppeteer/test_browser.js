const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    console.log("Navigating to http://localhost:8003...");
    await page.goto('http://localhost:8003', { waitUntil: 'networkidle0' });

    console.log("Evaluation check for UI...");
    const uiExists = await page.evaluate(() => typeof window.UI !== 'undefined');
    console.log("UI defined?", uiExists);

    await browser.close();
})();
