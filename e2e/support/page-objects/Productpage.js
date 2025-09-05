const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

/**
 * Product Detail Page Object
 */
class Productpage extends BasePage {
  constructor(page) {
    super(page);

    // Selectors based on component structure and semantic structure
    this.loadingText = "text=Loading...";
    this.errorText = ".text-red-600";
    this.productName = "h1.text-3xl";
    this.productPrice = "p.text-2xl";
    this.productDescription = "p.text-gray-700";
    this.stockCount = "span.text-green-600";
    this.quantityDecreaseBtn = 'button:has-text("-")';
    this.quantityIncreaseBtn = 'button:has-text("+")';
    this.quantityValue = 'span:text("1")';
    this.addToCartButton = 'button:has-text("Add to cart")';
    this.buyNowButton = 'button:has-text("Buy Now")';
    this.productImage = "img";
  }

  /**
   * Adjust product quantity
   */
  async increaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.click(this.quantityIncreaseBtn);
    }
  }

  /**
   * Add product to cart
   */
  async addToCart() {
    await this.page.click(this.addToCartButton);
    await this.waitForLoading(); // if you have global loader
  }

  /**
   * Click Buy Now button
   */
  async buyNow() {
    await this.page.click(this.buyNowButton);
    await this.waitForPageLoad();
    await this.verifyURL("/cart");
  }
}

module.exports = Productpage;
