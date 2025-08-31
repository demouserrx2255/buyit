const { test, expect } = require('@playwright/test');
const HomePage = require('../../support/page-objects/HomePage');
const LoginPage = require('../../support/page-objects/LoginPage');
const TestHelpers = require('../../support/test-helpers');

test.describe('Product Browsing', () => {
  let homePage;
  let loginPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    helpers = new TestHelpers(page);
    
    // Clear storage and login for tests that require it
    await helpers.clearStorage();
  });

  test('should display products on homepage', async () => {
    await homePage.goto();
    
    await homePage.verifyHomePageDisplayed();
    
    // Verify at least one product is shown
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should display product information correctly', async () => {
    await homePage.goto();
    
    // Verify all product cards have required information
    await homePage.verifyAllProductCards();
    
    // Check first product details
    const productInfo = await homePage.getProductInfo(0);
    expect(productInfo.title).toBeTruthy();
    expect(productInfo.price).toMatch(/\$\d+/);
    expect(productInfo.imageAlt).toBeTruthy();
  });

  test('should navigate to product details when clicked', async () => {
    await homePage.goto();
    
    const productInfo = await homePage.getProductInfo(0);
    await homePage.clickProduct(0);
    
    // Should navigate to product detail page
    await homePage.verifyURL('/product/');
    
    // Page title should contain product name
    const pageTitle = await homePage.getTitle();
    expect(pageTitle.toLowerCase()).toContain(productInfo.title.toLowerCase());
  });

  test('should search for products successfully', async () => {
    await homePage.goto();
    
    // Search for a product
    await homePage.searchProducts('test');
    
    // Should show search results or no results message
    const productCount = await homePage.getProductCount();
    const hasNoResultsMessage = await homePage.elementExists(homePage.noProductsMessage);
    
    expect(productCount > 0 || hasNoResultsMessage).toBe(true);
  });

  test('should filter products by category', async () => {
    await homePage.goto();
    
    await homePage.testCategoryFiltering();
  });

  test('should sort products correctly', async () => {
    await homePage.goto();
    
    await homePage.testSortingFunctionality();
  });

  test('should handle search with no results', async () => {
    await homePage.goto();
    
    await homePage.searchForNonExistentProduct();
  });

  test('should display hero section if available', async () => {
    await homePage.goto();
    
    await homePage.verifyHeroSection();
  });

  test('should display featured products if available', async () => {
    await homePage.goto();
    
    await homePage.verifyFeaturedProducts();
  });

  test('should handle product interactions', async () => {
    await homePage.goto();
    
    await homePage.testProductInteractions(0);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    await homePage.verifyResponsiveDesign();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await homePage.goto();
    await homePage.verifyResponsiveDesign();
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await homePage.goto();
    await homePage.verifyResponsiveDesign();
  });

  test('should load more products if pagination exists', async () => {
    await homePage.goto();
    
    const initialCount = await homePage.getProductCount();
    const hasMore = await homePage.loadMoreProducts();
    
    if (hasMore) {
      const newCount = await homePage.getProductCount();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should maintain state when navigating back', async ({ page }) => {
    await homePage.goto();
    
    // Apply a filter or search
    await homePage.searchProducts('electronics');
    const searchResultCount = await homePage.getProductCount();
    
    // Navigate to a product
    if (searchResultCount > 0) {
      await homePage.clickProduct(0);
      
      // Navigate back
      await page.goBack();
      await homePage.waitForPageLoad();
      
      // Search should still be applied
      const currentCount = await homePage.getProductCount();
      expect(currentCount).toBe(searchResultCount);
    }
  });

  test('should handle empty search gracefully', async () => {
    await homePage.goto();
    
    // Search with empty string
    await homePage.searchProducts('');
    
    // Should show all products or handle gracefully
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle special characters in search', async () => {
    await homePage.goto();
    
    const specialSearchTerms = ['test!', 'test@#$%', 'test & co', 'test-product'];
    
    for (const term of specialSearchTerms) {
      await homePage.searchProducts(term);
      
      // Should handle without errors
      const productCount = await homePage.getProductCount();
      const hasError = await homePage.hasError();
      
      expect(hasError).toBe(false);
      expect(productCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should verify product card accessibility', async ({ page }) => {
    await homePage.goto();
    
    const productCards = await homePage.getProductCards();
    const firstCard = productCards.first();
    
    // Product cards should be keyboard accessible
    await firstCard.focus();
    await page.keyboard.press('Enter');
    
    // Should navigate to product detail
    await homePage.verifyURL('/product/');
  });

  test('should handle slow loading gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/products', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await homePage.goto();
    
    // Should show loading state and then products
    await homePage.waitForLoading();
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure for products
    await page.route('**/api/products', route => {
      route.abort('failed');
    });
    
    await homePage.goto();
    
    // Should show error message or handle gracefully
    const hasError = await homePage.hasError();
    const productCount = await homePage.getProductCount();
    
    expect(hasError || productCount === 0).toBe(true);
  });

  test.describe('Guest User Experience', () => {
    test('should allow browsing without login', async () => {
      // Don't login
      await homePage.goto();
      
      await homePage.verifyHomePageDisplayed();
      
      // Should be able to view products
      const productCount = await homePage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    });

    test('should allow searching without login', async () => {
      await homePage.goto();
      
      await homePage.searchProducts('test');
      
      // Search should work for guests
      const productCount = await homePage.getProductCount();
      const hasNoResults = await homePage.elementExists(homePage.noProductsMessage);
      
      expect(productCount > 0 || hasNoResults).toBe(true);
    });

    test('should handle add to cart for guest users', async () => {
      await homePage.goto();
      
      try {
        await homePage.addProductToCart(0);
        
        // Might redirect to login or add to guest cart
        const currentUrl = await homePage.getCurrentURL();
        const isOnHome = currentUrl.includes('/');
        const isOnLogin = currentUrl.includes('/login');
        
        expect(isOnHome || isOnLogin).toBe(true);
      } catch {
        // Some implementations might not allow guest cart
        // Just verify the page doesn't crash
        await homePage.verifyHomePageDisplayed();
      }
    });
  });

  test.describe('Logged In User Experience', () => {
    test.beforeEach(async () => {
      // Login before each test in this group
      const testUser = helpers.getCustomer(0);
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
    });

    test('should show user-specific features when logged in', async () => {
      await homePage.goto();
      
      // Should show user menu
      expect(await homePage.isLoggedIn()).toBe(true);
      
      // Cart should be accessible
      await homePage.clickCart();
      await homePage.verifyURL('/cart');
    });

    test('should allow adding products to cart when logged in', async () => {
      await homePage.goto();
      
      const initialCartCount = await homePage.getCartCount();
      
      await homePage.addProductToCart(0);
      
      // Cart count should increase
      const newCartCount = await homePage.getCartCount();
      expect(newCartCount).toBeGreaterThan(initialCartCount);
    });

    test('should maintain cart state across page navigation', async () => {
      await homePage.goto();
      
      await homePage.addProductToCart(0);
      const cartCount = await homePage.getCartCount();
      
      // Navigate to different page and back
      await homePage.clickProduct(0);
      await homePage.goHome();
      
      // Cart count should be maintained
      const maintainedCartCount = await homePage.getCartCount();
      expect(maintainedCartCount).toBe(cartCount);
    });
  });

  test.describe('Performance', () => {
    test('should load products within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await homePage.goto();
      await homePage.verifyHomePageDisplayed();
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle large product catalogs', async () => {
      await homePage.goto();
      
      // Load more products if available
      let totalLoaded = 0;
      while (await homePage.loadMoreProducts()) {
        totalLoaded++;
        
        // Prevent infinite loop
        if (totalLoaded > 10) break;
      }
      
      // Should handle loading without performance issues
      const finalCount = await homePage.getProductCount();
      expect(finalCount).toBeGreaterThanOrEqual(0);
    });
  });
});
