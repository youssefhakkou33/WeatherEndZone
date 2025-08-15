const { chromium } = require('playwright');

async function simpleDemo() {
  console.log('🎭 Simple Playwright Demo Starting...\n');
  
  // Launch browser with visible window
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down by 1 second per action so you can see what's happening
  });
  
  const page = await browser.newPage();

  try {
    console.log('📍 Opening Google...');
    await page.goto('https://www.google.com');
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'test-results/demo-google.png' });
    
    console.log('🔍 Searching for "playwright"...');
    await page.fill('textarea[name="q"]', 'playwright automation testing');
    await page.press('textarea[name="q"]', 'Enter');
    
    console.log('⏳ Waiting for results...');
    await page.waitForSelector('h3');
    
    console.log('📸 Taking search results screenshot...');
    await page.screenshot({ path: 'test-results/demo-search-results.png' });
    
    console.log('✅ Demo completed! Check test-results folder for screenshots.');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    console.log('🔚 Closing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

simpleDemo();
