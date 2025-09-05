const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class OrderPage extends BasePage {
  constructor(page) {
    super(page);

    // Orders page selectors
    this.orderList = '[data-testid="order-id"]';
    this.successMessage = '[data-testid="success-message"]';
    this.noOrdersMessage = "text=You have no orders yet.";
  }

  async getFirstOrder() {
    console.log(
      "this.page.locator(this.orderList).first()",
      this.page.locator(this.orderList).first()
    );
    return this.page.locator(this.orderList).first();
  }
}

module.exports = OrderPage;
