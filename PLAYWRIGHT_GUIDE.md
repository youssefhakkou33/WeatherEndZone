# Playwright Testing Guide for WeatherEndZone

## 🎭 What is Playwright?

Playwright is a powerful end-to-end testing framework that allows you to:
- Test your web app across Chrome, Firefox, and Safari
- Simulate real user interactions (clicking, typing, scrolling)
- Test on different devices (mobile, tablet, desktop)
- Take screenshots and record videos
- Check accessibility and performance

## 🚀 Quick Start

### 1. Run All Tests
```bash
npm test
```

### 2. Run Tests with Browser Visible
```bash
npm run test:headed
```

### 3. Debug Tests Step by Step
```bash
npm run test:debug
```

### 4. View Test Report
```bash
npm run test:report
```

## 📱 Test Coverage

Our Playwright tests cover:

### Basic Functionality (`basic-functionality.spec.js`)
- ✅ Homepage loads correctly
- ✅ All UI elements are present
- ✅ City search works
- ✅ Loading states display
- ✅ Mobile responsiveness
- ✅ Error handling for invalid cities

### Advanced Features (`advanced-features.spec.js`)
- ✅ Weather forecast details
- ✅ Geolocation support
- ✅ 7-day forecast display
- ✅ Timezone information
- ✅ Cross-browser compatibility
- ✅ Performance testing

### Visual & Accessibility (`visual-accessibility.spec.js`)
- ✅ Accessibility features (alt text, labels)
- ✅ Keyboard navigation
- ✅ Dark mode support
- ✅ Weather icons display
- ✅ Screen orientation handling
- ✅ Error state handling
- ✅ Visual consistency

## 🛠 How to Use Playwright

### Basic Test Structure
```javascript
const { test, expect } = require('@playwright/test');

test('my test name', async ({ page }) => {
  // Navigate to your app
  await page.goto('/');
  
  // Interact with elements
  await page.fill('input[placeholder*="city"]', 'London');
  await page.click('button');
  
  // Check results
  await expect(page.locator('text=London')).toBeVisible();
  
  // Take screenshot
  await page.screenshot({ path: 'my-test.png' });
});
```

### Common Playwright Commands

#### Navigation
```javascript
await page.goto('/');                    // Go to homepage
await page.goto('https://example.com');  // Go to external site
```

#### Finding Elements
```javascript
page.locator('input');                   // Find input element
page.locator('text=Hello');              // Find text content
page.locator('.my-class');               // Find by CSS class
page.locator('#my-id');                  // Find by ID
```

#### Interactions
```javascript
await page.click('button');              // Click button
await page.fill('input', 'text');        // Type text
await page.press('input', 'Enter');      // Press key
await page.selectOption('select', 'value'); // Select dropdown
```

#### Waiting and Checking
```javascript
await page.waitForSelector('.weather');  // Wait for element
await page.waitForTimeout(3000);         // Wait 3 seconds
await expect(element).toBeVisible();     // Check if visible
await expect(element).toHaveText('Hello'); // Check text content
```

#### Screenshots and Videos
```javascript
await page.screenshot({ path: 'test.png' });           // Screenshot
await page.screenshot({ path: 'test.png', fullPage: true }); // Full page
```

#### Mobile Testing
```javascript
await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
```

## 🔧 Configuration

The `playwright.config.js` file controls:
- Which browsers to test (Chrome, Firefox, Safari)
- Mobile device simulation
- Screenshot/video recording
- Test timeouts
- Local server setup

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

This shows:
- ✅ Passed tests
- ❌ Failed tests
- 📸 Screenshots
- 🎥 Videos (for failures)
- ⏱ Performance data

## 🐛 Debugging Tips

### Debug Mode
```bash
npm run test:debug
```
This opens a browser where you can:
- Step through tests line by line
- Inspect elements
- See console logs
- Modify test code live

### Headed Mode
```bash
npm run test:headed
```
Runs tests with browser visible so you can see what's happening.

### Console Logs
Add console logs to your tests:
```javascript
console.log('Current URL:', page.url());
console.log('Element count:', await elements.count());
```

## 📝 Writing Your Own Tests

### Test Template
```javascript
const { test, expect } = require('@playwright/test');

test.describe('My Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

### Best Practices
1. **Use descriptive test names**: `'should display weather for valid city'`
2. **Wait for elements**: Use `waitForSelector()` instead of `waitForTimeout()`
3. **Take screenshots**: Help with debugging failures
4. **Test error cases**: Invalid inputs, network failures
5. **Keep tests independent**: Each test should work alone

## 🚨 Common Issues

### Test Fails: "Element not found"
- Element might not be loaded yet
- Use `await page.waitForSelector()`
- Check if selector is correct

### Test Fails: "Timeout"
- Increase timeout: `{ timeout: 10000 }`
- Check if app is actually loading
- Verify network requests are completing

### Screenshots Not Saving
- Make sure `test-results` folder exists
- Check file permissions
- Use absolute paths if needed

## 🎯 Next Steps

1. **Run the basic tests**: `npm test`
2. **Check the HTML report**: `npm run test:report`
3. **Try debug mode**: `npm run test:debug`
4. **Write custom tests** for your specific features
5. **Set up CI/CD** to run tests automatically

Happy testing! 🎭✨
