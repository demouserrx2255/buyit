const { expect } = require("@playwright/test");

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
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    try {
      await this.page.waitForSelector(this.loadingSpinner, { timeout: 1000 });
      await this.page.waitForSelector(this.loadingSpinner, {
        state: "hidden",
        timeout: 10000,
      });
    } catch {
      // Loading spinner might not appear for fast operations
    }
  }

  /**
   * Verify URL
   */
  async verifyURL(expectedPath) {
    console.log("expectedPath: ", expectedPath);
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, {
      state: "visible",
      timeout,
    });
  }
}

module.exports = BasePage;
