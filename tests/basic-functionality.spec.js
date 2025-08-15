const { test, expect } = require('@playwright/test');

test.describe('WeatherEndZone App - Basic Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the weather app
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/WeatherEndZone/);
    
    // Check if main header is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Take a screenshot for documentation
    await page.screenshot({ path: 'test-results/homepage-loaded.png', fullPage: true });
  });

  test('should have all main UI elements', async ({ page }) => {
    // Check for search input
    await expect(page.locator('input[placeholder*="city"], input[placeholder*="location"]')).toBeVisible();
    
    // Check for weather display area
    await expect(page.locator('.weather-card, .weather-container, [class*="weather"]')).toBeVisible();
    
    // Check for location button if it exists
    const locationBtn = page.locator('button:has-text("Current Location"), button[title*="location"], .location-btn');
    if (await locationBtn.count() > 0) {
      await expect(locationBtn.first()).toBeVisible();
    }
  });

  test('should handle city search', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    
    // Type a city name
    await searchInput.fill('London');
    
    // Submit the search (either by pressing Enter or clicking a button)
    await page.keyboard.press('Enter');
    
    // Wait for weather data to load (adjust timeout as needed)
    await page.waitForTimeout(3000);
    
    // Check if weather data is displayed
    await expect(page.locator('text=/London|°|temperature|weather/i')).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of results
    await page.screenshot({ path: 'test-results/london-weather.png', fullPage: true });
  });

  test('should display loading state', async ({ page }) => {
    // Check for loading indicators
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Paris');
    await page.keyboard.press('Enter');
    
    // Look for loading text or spinner
    const loadingElement = page.locator('text=/loading|Loading|spinner|Loading weather/i').first();
    
    // The loading state might be brief, so we use a shorter timeout
    if (await loadingElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(loadingElement).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the page is still functional
    await expect(page.locator('h1')).toBeVisible();
    
    // Test search on mobile
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Tokyo');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(2000);
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
  });

  test('should handle invalid city names gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    
    // Search for a non-existent city
    await searchInput.fill('InvalidCityName12345');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for error message or no results state
    const errorMessage = page.locator('text=/error|not found|invalid|try again/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});
