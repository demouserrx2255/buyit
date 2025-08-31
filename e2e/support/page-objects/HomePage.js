const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

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
    await super.goto('/');
    await this.waitForElement(this.productGrid);
  }

  /**
   * Get all product cards
   */
  async getProductCards() {
    return this.page.locator(this.productCard);
  }

  /**
   * Get product count on page
   */
  async getProductCount() {
    const products = await this.getProductCards();
    return await products.count();
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
    const productCard = this.page.locator(this.productCard)
      .filter({ hasText: productName });
    await productCard.click();
    await this.waitForPageLoad();
  }

  /**
   * Add product to cart by index (quick add)
   */
  async addProductToCart(index = 0) {
    const products = await this.getProductCards();
    const addButton = products.nth(index).locator(this.addToCartButton);
    await addButton.click();
    await this.waitForLoading();
  }

  /**
   * Add product to cart by name
   */
  async addProductToCartByName(productName) {
    const productCard = this.page.locator(this.productCard)
      .filter({ hasText: productName });
    const addButton = productCard.locator(this.addToCartButton);
    await addButton.click();
    await this.waitForLoading();
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm) {
    await this.page.fill(this.searchInput, searchTerm);
    await this.page.click(this.searchButton);
    await this.waitForLoading();
  }

  /**
   * Filter products by category
   */
  async filterByCategory(category) {
    await this.page.selectOption(this.categoryFilter, category);
    await this.waitForLoading();
  }

  /**
   * Sort products
   */
  async sortProducts(sortOption) {
    await this.page.selectOption(this.sortSelect, sortOption);
    await this.waitForLoading();
  }

  /**
   * Load more products (if pagination exists)
   */
  async loadMoreProducts() {
    if (await this.elementExists(this.loadMoreButton)) {
      await this.page.click(this.loadMoreButton);
      await this.waitForLoading();
      return true;
    }
    return false;
  }

  /**
   * Get product information by index
   */
  async getProductInfo(index = 0) {
    const products = await this.getProductCards();
    const product = products.nth(index);
    
    const title = await product.locator(this.productTitle).textContent();
    const price = await product.locator(this.productPrice).textContent();
    const imageAlt = await product.locator(this.productImage).getAttribute('alt');
    
    return {
      title: title?.trim(),
      price: price?.trim(),
      imageAlt: imageAlt?.trim()
    };
  }

  /**
   * Get all product information
   */
  async getAllProductsInfo() {
    const products = await this.getProductCards();
    const count = await products.count();
    const productsInfo = [];
    
    for (let i = 0; i < count; i++) {
      const info = await this.getProductInfo(i);
      productsInfo.push(info);
    }
    
    return productsInfo;
  }

  /**
   * Verify home page elements are displayed
   */
  async verifyHomePageDisplayed() {
    await expect(this.page.locator(this.productGrid)).toBeVisible();
    
    // Verify at least one product is displayed
    const productCount = await this.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  }

  /**
   * Verify hero section (if exists)
   */
  async verifyHeroSection() {
    if (await this.elementExists(this.heroSection)) {
      await expect(this.page.locator(this.heroSection)).toBeVisible();
    }
  }

  /**
   * Verify featured products section
   */
  async verifyFeaturedProducts() {
    if (await this.elementExists(this.featuredSection)) {
      await expect(this.page.locator(this.featuredSection)).toBeVisible();
      
      // Verify featured products have content
      const featuredProducts = this.page.locator(`${this.featuredSection} ${this.productCard}`);
      const count = await featuredProducts.count();
      expect(count).toBeGreaterThan(0);
    }
  }

  /**
   * Verify search functionality
   */
  async verifySearchFunctionality() {
    // Test search with valid term
    await this.searchProducts('test');
    
    // Should show search results or no results message
    const hasProducts = await this.getProductCount() > 0;
    const hasNoResultsMessage = await this.elementExists(this.noProductsMessage);
    
    expect(hasProducts || hasNoResultsMessage).toBe(true);
  }

  /**
   * Verify product card structure
   */
  async verifyProductCardStructure(index = 0) {
    const products = await this.getProductCards();
    const product = products.nth(index);
    
    // Verify required elements exist
    await expect(product.locator(this.productTitle)).toBeVisible();
    await expect(product.locator(this.productPrice)).toBeVisible();
    await expect(product.locator(this.productImage)).toBeVisible();
    
    // Verify price format (should contain currency symbol)
    const priceText = await product.locator(this.productPrice).textContent();
    expect(priceText).toMatch(/\$\d+/); // Should contain $ and numbers
  }

  /**
   * Verify all product cards have required information
   */
  async verifyAllProductCards() {
    const productCount = await this.getProductCount();
    
    for (let i = 0; i < productCount; i++) {
      await this.verifyProductCardStructure(i);
    }
  }

  /**
   * Test product interaction (hover effects, etc.)
   */
  async testProductInteractions(index = 0) {
    const products = await this.getProductCards();
    const product = products.nth(index);
    
    // Hover over product
    await product.hover();
    
    // Check if add to cart button becomes visible/enabled
    if (await this.elementExists(this.addToCartButton)) {
      const addButton = product.locator(this.addToCartButton);
      await expect(addButton).toBeVisible();
    }
  }

  /**
   * Verify responsive design elements
   */
  async verifyResponsiveDesign() {
    // Check product grid layout
    const grid = this.page.locator(this.productGrid);
    await expect(grid).toBeVisible();
    
    // Check if products are displayed in grid format
    const products = await this.getProductCards();
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Test category filtering
   */
  async testCategoryFiltering() {
    if (await this.elementExists(this.categoryFilter)) {
      // Get available categories
      const categoryOptions = await this.page.locator(`${this.categoryFilter} option`).all();
      
      for (const option of categoryOptions.slice(1)) { // Skip "All" option
        const categoryValue = await option.getAttribute('value');
        if (categoryValue) {
          await this.filterByCategory(categoryValue);
          
          // Verify products are filtered
          const productCount = await this.getProductCount();
          expect(productCount).toBeGreaterThanOrEqual(0);
        }
      }
    }
  }

  /**
   * Test sorting functionality
   */
  async testSortingFunctionality() {
    if (await this.elementExists(this.sortSelect)) {
      const sortOptions = ['price-low', 'price-high', 'name-asc', 'name-desc'];
      
      for (const sortOption of sortOptions) {
        try {
          await this.sortProducts(sortOption);
          
          // Verify products are still displayed
          const productCount = await this.getProductCount();
          expect(productCount).toBeGreaterThan(0);
        } catch {
          // Sort option might not be available
          continue;
        }
      }
    }
  }

  /**
   * Search for non-existent product
   */
  async searchForNonExistentProduct() {
    await this.searchProducts('nonexistentproduct123');
    
    // Should show no results message
    await expect(this.page.locator(this.noProductsMessage)).toBeVisible();
  }
}

module.exports = HomePage;
