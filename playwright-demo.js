const { chromium } = require('playwright');

async function demoWeatherApp() {
  console.log('🎭 Starting Playwright demo for WeatherEndZone app...\n');
  
  // Launch browser (set headless: false to see the browser)
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('📍 Step 1: Opening your weather app...');
    await page.goto('http://localhost:3000');
    
    console.log('📸 Step 2: Taking initial screenshot...');
    await page.screenshot({ path: 'test-results/demo-1-initial.png', fullPage: true });
    
    console.log('🔍 Step 3: Finding search input...');
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('⌨️  Step 4: Searching for London...');
    await searchInput.fill('London');
    await page.keyboard.press('Enter');
    
    console.log('⏳ Step 5: Waiting for weather data...');
    await page.waitForTimeout(4000);
    
    console.log('📸 Step 6: Taking screenshot with weather data...');
    await page.screenshot({ path: 'test-results/demo-2-london-weather.png', fullPage: true });
    
    console.log('📱 Step 7: Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'test-results/demo-3-mobile-view.png', fullPage: true });
    
    console.log('🌍 Step 8: Testing another city...');
    await page.setViewportSize({ width: 1200, height: 800 }); // Back to desktop
    await searchInput.fill('Tokyo');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'test-results/demo-4-tokyo-weather.png', fullPage: true });
    
    console.log('✅ Demo completed successfully!');
    console.log('📁 Screenshots saved in test-results/ folder');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    console.log('🔚 Closing browser...');
    await browser.close();
  }
}

// Run the demo
demoWeatherApp();
