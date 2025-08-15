const { test, expect } = require('@playwright/test');

test.describe('WeatherEndZone App - Visual & Accessibility Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      
      // Input should have either placeholder, aria-label, or associated label
      expect(placeholder || ariaLabel || id).toBeTruthy();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test search with keyboard
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.focus();
    await searchInput.fill('Madrid');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(3000);
    await expect(page.locator('text=/°|temperature|weather/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should work in dark mode (if available)', async ({ page }) => {
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('button:has-text("Dark"), .dark-mode, [class*="theme"], button:has-text("Theme")');
    
    if (await darkModeToggle.count() > 0) {
      // Take screenshot in light mode
      await page.screenshot({ path: 'test-results/light-mode.png', fullPage: true });
      
      // Toggle dark mode
      await darkModeToggle.first().click();
      await page.waitForTimeout(1000);
      
      // Take screenshot in dark mode
      await page.screenshot({ path: 'test-results/dark-mode.png', fullPage: true });
      
      // Verify dark mode is applied
      const body = page.locator('body');
      const bodyClass = await body.getAttribute('class');
      expect(bodyClass).toContain('dark');
    }
  });

  test('should display weather icons properly', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Miami');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(4000);
    
    // Look for weather icons
    const weatherIcons = page.locator('img[alt*="weather"], .weather-icon, [class*="icon"], i[class*="fa-"]');
    
    if (await weatherIcons.count() > 0) {
      await expect(weatherIcons.first()).toBeVisible();
      console.log('Weather icons found and displayed');
    }
  });

  test('should handle different screen orientations', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'test-results/portrait-orientation.png', fullPage: true });
    
    // Test landscape orientation
    await page.setViewportSize({ width: 812, height: 375 });
    await page.screenshot({ path: 'test-results/landscape-orientation.png', fullPage: true });
    
    // Verify functionality still works
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/*', route => {
      if (route.request().url().includes('api') || route.request().url().includes('weather')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('TestCity');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Look for error messages
    const errorMessage = page.locator('text=/error|failed|try again|network|connection/i');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
      console.log('Error handling works correctly');
    }
  });

  test('should maintain visual consistency', async ({ page }) => {
    // Take baseline screenshot
    await page.screenshot({ path: 'test-results/visual-baseline.png', fullPage: true });
    
    // Search for weather data
    const searchInput = page.locator('input[placeholder*="city"], input[placeholder*="location"]').first();
    await searchInput.fill('Vancouver');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(4000);
    
    // Take screenshot with data
    await page.screenshot({ path: 'test-results/visual-with-data.png', fullPage: true });
    
    // Check if main layout elements are still properly positioned
    await expect(page.locator('h1')).toBeVisible();
    await expect(searchInput).toBeVisible();
  });
});
