const { expect } = require("@playwright/test");
const testData = require("../fixtures/test-data.json");

/**
 * Helper functions for E2E tests
 */
class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Get a specific customer by index
   */
  getCustomer(index = 0) {
    return testData.customers[index];
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
   * Verify URL contains expected path
   */
  async verifyURL(expectedPath) {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }
}

module.exports = TestHelpers;
1;
