const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

/**
 * Home Page Object
 */
class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // Home page specific selectors
    this.productGrid = '[data-testid="product-grid"]';
    this.productCard = '[data-testid="product-card"]';
    this.productTitle = '[data-testid="product-title"]';
    this.productPrice = '[data-testid="product-price"]';
    this.productImage = '[data-testid="product-image"]';
    this.addToCartButton = '[data-testid="add-to-cart-quick"]';
    this.viewProductButton = '[data-testid="view-product"]';
    this.searchInput = '[data-testid="search-input"]';
    this.searchButton = '[data-testid="search-button"]';
    this.categoryFilter = '[data-testid="category-filter"]';
    this.sortSelect = '[data-testid="sort-select"]';
    this.featuredSection = '[data-testid="featured-products"]';
    this.heroSection = '[data-testid="hero-section"]';
    this.loadMoreButton = '[data-testid="load-more"]';
    this.noProductsMessage = '[data-testid="no-products"]';
  }

  /**
   * Navigate to home page
   */
  async goto() {
    await super.goto("/");
    await this.waitForElement(this.productGrid);
  }

  /**
   * Get all product cards
   */
  async getProductCards() {
    return this.page.locator(this.productCard);
  }

  /**
   * Click on a specific product by index
   */
  async clickProduct(index = 0) {
    const products = await this.getProductCards();
    await products.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Click on a product by name
   */
  async clickProductByName(productName) {
    const productCard = this.page
      .locator(this.productCard)
      .filter({ hasText: productName });
    await productCard.click();
    await this.waitForPageLoad();
  }

  // /**
  //  * Get product information by index
  //  */
  async getProductInfo(index = 0) {
    const products = await this.getProductCards();
    const product = products.nth(index);

    const title = await product.locator(this.productTitle).textContent();
    const price = await product.locator(this.productPrice).textContent();
    const imageAlt = await product
      .locator(this.productImage)
      .getAttribute("alt");

    return {
      title: title?.trim(),
      price: price?.trim(),
      imageAlt: imageAlt?.trim(),
    };
  }
}

module.exports = HomePage;
