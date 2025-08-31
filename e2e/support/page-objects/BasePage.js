const { expect } = require('@playwright/test');

/**
 * Base Page Object - Contains common functionality for all pages
 */
class BasePage {
  constructor(page) {
    this.page = page;
    
    // Common selectors
    this.header = '[data-testid="header"]';
    this.logo = '[data-testid="logo"]';
    this.cartButton = '[data-testid="cart-button"]';
    this.cartCount = '[data-testid="cart-count"]';
    this.userMenu = '[data-testid="user-menu"]';
    this.logoutButton = '[data-testid="logout-button"]';
    this.loadingSpinner = '[data-testid="loading"]';
    this.errorMessage = '[data-testid="error-message"]';
    this.successMessage = '[data-testid="success-message"]';
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url) {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn() {
    try {
      await this.page.waitForSelector(this.userMenu, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get cart count
   */
  async getCartCount() {
    try {
      const cartCountElement = this.page.locator(this.cartCount);
      const count = await cartCountElement.textContent();
      return parseInt(count) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Click cart button
   */
  async clickCart() {
    await this.page.click(this.cartButton);
    await this.waitForPageLoad();
  }

  /**
   * Logout user
   */
  async logout() {
    if (await this.isLoggedIn()) {
      await this.page.click(this.logoutButton);
      await this.waitForPageLoad();
    }
  }

  /**
   * Navigate to home page
   */
  async goHome() {
    await this.page.click(this.logo);
    await this.waitForPageLoad();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    try {
      await this.page.waitForSelector(this.loadingSpinner, { timeout: 1000 });
      await this.page.waitForSelector(this.loadingSpinner, { 
        state: 'hidden',
        timeout: 10000 
      });
    } catch {
      // Loading spinner might not appear for fast operations
    }
  }

  /**
   * Check for error message
   */
  async hasError() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    const errorElement = this.page.locator(this.errorMessage);
    return await errorElement.textContent();
  }

  /**
   * Check for success message
   */
  async hasSuccess() {
    try {
      await this.page.waitForSelector(this.successMessage, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get success message text
   */
  async getSuccessMessage() {
    const successElement = this.page.locator(this.successMessage);
    return await successElement.textContent();
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  /**
   * Verify URL
   */
  async verifyURL(expectedPath) {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `e2e/test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
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
   * Get page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL() {
    return this.page.url();
  }
}

module.exports = BasePage;
