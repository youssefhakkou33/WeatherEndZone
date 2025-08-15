const { test, expect } = require('@playwright/test');

test.describe('WeatherEndZone App - Advanced Features', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display weather forecast details', async ({ page }) => {
    // Search for a city
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('New York');
    await page.keyboard.press('Enter');
    
    // Wait for data to load
    await page.waitForTimeout(4000);
    
    // Check for forecast elements (temperature, description, etc.)
    await expect(page.locator('text=/°|temperature|weather|forecast/i').first()).toBeVisible({ timeout: 10000 });
    
    // Look for additional weather details
    const weatherDetails = [
      'humidity', 'wind', 'pressure', 'feels like', 
      'sunrise', 'sunset', 'visibility'
    ];
    
    for (const detail of weatherDetails) {
      const element = page.locator(`text=/${detail}/i`);
      if (await element.count() > 0) {
        console.log(`Found weather detail: ${detail}`);
      }
    }
  });

  test('should handle geolocation (if supported)', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
    
    // Set a mock location (New York coordinates)
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
    
    // Look for current location button
    const locationBtn = page.locator('button:has-text("Current Location"), button[title*="location"], .location-btn, button:has-text("Use Location")');
    
    if (await locationBtn.count() > 0) {
      await locationBtn.first().click();
      
      // Wait for location-based weather to load
      await page.waitForTimeout(5000);
      
      // Check if weather data is displayed
      await expect(page.locator('text=/°|temperature|weather/i').first()).toBeVisible({ timeout: 10000 });
      
      await page.screenshot({ path: 'test-results/geolocation-weather.png', fullPage: true });
    }
  });

  test('should display 7-day forecast if available', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('California');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(4000);
    
    // Look for multiple day forecasts
    const forecastDays = page.locator('[class*="day"], [class*="forecast"], .weather-day');
    const dayCount = await forecastDays.count();
    
    if (dayCount > 1) {
      console.log(`Found ${dayCount} forecast days`);
      await expect(forecastDays.first()).toBeVisible();
    }
    
    // Check for day names or dates
    await expect(page.locator('text=/monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle timezone display', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('London');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(4000);
    
    // Look for time-related information
    const timeElements = page.locator('text=/time|timezone|GMT|UTC|AM|PM|:/');
    if (await timeElements.count() > 0) {
      await expect(timeElements.first()).toBeVisible();
      console.log('Timezone information found');
    }
  });

  test('should work across different browsers', async ({ page, browserName }) => {
    console.log(`Testing on ${browserName}`);
    
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Sydney');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Basic functionality should work across all browsers
    await expect(page.locator('text=/°|temperature|weather/i').first()).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: `test-results/sydney-weather-${browserName}.png`, fullPage: true });
  });

  test('should maintain performance', async ({ page }) => {
    // Navigate and measure performance
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(5000);
    
    // Test search performance
    const searchStart = Date.now();
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Berlin');
    await page.keyboard.press('Enter');
    
    // Wait for weather data
    await page.waitForSelector('text=/°|temperature|weather/i', { timeout: 10000 });
    
    const searchTime = Date.now() - searchStart;
    console.log(`Search response time: ${searchTime}ms`);
    
    // Search should complete within reasonable time
    expect(searchTime).toBeLessThan(10000);
  });
});
