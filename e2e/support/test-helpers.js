const { expect } = require('@playwright/test');
const testData = require('../fixtures/test-data.json');

/**
 * Helper functions for E2E tests
 */
class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Get test data
   */
  getTestData() {
    return testData;
  }

  /**
   * Get a random customer from test data
   */
  getRandomCustomer() {
    const customers = testData.customers;
    return customers[Math.floor(Math.random() * customers.length)];
  }

  /**
   * Get a specific customer by index
   */
  getCustomer(index = 0) {
    return testData.customers[index];
  }

  /**
   * Get a random product from test data
   */
  getRandomProduct() {
    const products = testData.products;
    return products[Math.floor(Math.random() * products.length)];
  }

  /**
   * Get a specific product by index
   */
  getProduct(index = 0) {
    return testData.products[index];
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `e2e/test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn() {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if cart has items
   */
  async getCartCount() {
    try {
      const cartCountElement = await this.page.locator('[data-testid="cart-count"]');
      const count = await cartCountElement.textContent();
      return parseInt(count) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Clear browser storage
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(url, method = 'GET') {
    return this.page.waitForResponse(response => 
      response.url().includes(url) && response.request().method() === method
    );
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Generate unique email for testing
   */
  generateUniqueEmail(prefix = 'test') {
    const timestamp = Date.now();
    return `${prefix}${timestamp}@test.com`;
  }

  /**
   * Generate unique name for testing
   */
  generateUniqueName(prefix = 'Test User') {
    const timestamp = Date.now();
    return `${prefix} ${timestamp}`;
  }

  /**
   * Format price for comparison
   */
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  /**
   * Calculate cart total
   */
  calculateCartTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Verify page title contains expected text
   */
  async verifyPageTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Verify URL contains expected path
   */
  async verifyURL(expectedPath) {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Fill form with data
   */
  async fillForm(formData) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.page.fill(selector, value);
    }
  }

  /**
   * Wait for toast/notification message
   */
  async waitForNotification(message, timeout = 5000) {
    await this.page.waitForSelector(
      `[data-testid="notification"]:has-text("${message}")`,
      { timeout }
    );
  }
}

module.exports = TestHelpers;
