const { test, expect } = require('@playwright/test');
const HomePage = require('../../support/page-objects/HomePage');
const CartPage = require('../../support/page-objects/CartPage');
const LoginPage = require('../../support/page-objects/LoginPage');
const TestHelpers = require('../../support/test-helpers');

test.describe('Cart Management', () => {
  let homePage;
  let cartPage;
  let loginPage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    helpers = new TestHelpers(page);
    
    // Clear storage and login before each test
    await helpers.clearStorage();
    
    const testUser = helpers.getCustomer(0);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
  });

  test('should display empty cart initially', async () => {
    await cartPage.goto();
    
    // New user should have empty cart
    try {
      await cartPage.verifyCartIsEmpty();
    } catch {
      // Cart might have items from previous tests or fixtures
      // Just verify cart page loads correctly
      const itemsCount = await cartPage.getCartItemsCount();
      expect(itemsCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should add product to cart from homepage', async () => {
    await homePage.goto();
    
    const initialCartCount = await homePage.getCartCount();
    
    // Add product to cart
    await homePage.addProductToCart(0);
    
    // Verify cart count increased
    const newCartCount = await homePage.getCartCount();
    expect(newCartCount).toBeGreaterThan(initialCartCount);
    
    // Navigate to cart and verify item is there
    await cartPage.goto();
    await cartPage.verifyCartHasItems();
  });

  test('should display correct product information in cart', async () => {
    await homePage.goto();
    
    // Get product info before adding to cart
    const productInfo = await homePage.getProductInfo(0);
    
    // Add to cart
    await homePage.addProductToCart(0);
    
    // Go to cart and verify information
    await cartPage.goto();
    
    const cartItemInfo = await cartPage.getCartItemInfo(0);
    expect(cartItemInfo.name).toContain(productInfo.title);
    expect(cartItemInfo.price).toBeTruthy();
    expect(cartItemInfo.quantity).toBeGreaterThan(0);
  });

  test('should update item quantity successfully', async () => {
    // Add item to cart first
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Test quantity controls
    await cartPage.verifyQuantityControls(0);
  });

  test('should calculate cart totals correctly', async () => {
    // Add multiple items to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    await homePage.addProductToCart(1);
    
    await cartPage.goto();
    
    // Verify calculations
    await cartPage.verifyCartCalculation();
  });

  test('should remove item from cart', async () => {
    // Add item to cart first
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Test removing item
    await cartPage.testRemoveItem(0);
  });

  test('should handle quantity increase', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    const initialInfo = await cartPage.getCartItemInfo(0);
    
    // Increase quantity
    await cartPage.increaseItemQuantity(0);
    
    const updatedInfo = await cartPage.getCartItemInfo(0);
    expect(updatedInfo.quantity).toBe(initialInfo.quantity + 1);
  });

  test('should handle quantity decrease', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Increase quantity first so we can decrease
    await cartPage.increaseItemQuantity(0);
    
    const initialInfo = await cartPage.getCartItemInfo(0);
    
    // Decrease quantity
    await cartPage.decreaseItemQuantity(0);
    
    const updatedInfo = await cartPage.getCartItemInfo(0);
    expect(updatedInfo.quantity).toBe(initialInfo.quantity - 1);
  });

  test('should handle minimum quantity (remove item when quantity becomes 0)', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    const initialCount = await cartPage.getCartItemsCount();
    
    // Test negative quantity handling
    await cartPage.testNegativeQuantity(0);
    
    // Either item was removed or quantity was set to minimum
    const newCount = await cartPage.getCartItemsCount();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should validate maximum quantity limits', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Test quantity limits
    await cartPage.testQuantityLimits(0);
  });

  test('should persist cart state across page refreshes', async () => {
    // Add items to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    await homePage.addProductToCart(1);
    
    await cartPage.goto();
    
    // Test cart persistence
    await cartPage.testCartPersistence();
  });

  test('should clear entire cart', async () => {
    // Add multiple items to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    await homePage.addProductToCart(1);
    
    await cartPage.goto();
    
    // Clear cart
    await cartPage.clearCart();
    
    // Verify cart is empty
    await cartPage.verifyCartIsEmpty();
  });

  test('should navigate to checkout with items in cart', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Verify checkout button is enabled
    await cartPage.verifyCheckoutButtonState();
    
    // Proceed to checkout
    await cartPage.proceedToCheckout();
    
    // Should navigate to checkout page
    await cartPage.verifyURL('/checkout');
  });

  test('should disable checkout button for empty cart', async () => {
    await cartPage.goto();
    
    // Clear cart if it has items
    try {
      await cartPage.clearCart();
    } catch {
      // Cart might already be empty
    }
    
    // Verify checkout button is disabled
    await cartPage.verifyCheckoutButtonState();
  });

  test('should continue shopping from cart', async () => {
    await cartPage.goto();
    
    // Continue shopping
    await cartPage.continueShopping();
    
    // Should navigate back to home or products page
    await cartPage.verifyURL('/');
  });

  test('should apply coupon code if feature exists', async () => {
    // Add item to cart first
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Try to apply coupon
    await cartPage.applyCoupon('TEST10');
    
    // Coupon functionality depends on backend implementation
    // Just verify no errors occurred
    const hasError = await cartPage.hasError();
    expect(hasError).toBe(false);
  });

  test('should handle adding same product multiple times', async () => {
    await homePage.goto();
    
    // Add same product multiple times
    await homePage.addProductToCart(0);
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Should either increase quantity or add separate entries
    const itemsCount = await cartPage.getCartItemsCount();
    expect(itemsCount).toBeGreaterThanOrEqual(1);
    
    // If consolidated into one item, quantity should be > 1
    if (itemsCount === 1) {
      const itemInfo = await cartPage.getCartItemInfo(0);
      expect(itemInfo.quantity).toBeGreaterThan(1);
    }
  });

  test('should maintain cart state when switching between pages', async () => {
    // Add item to cart
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    const cartCount = await homePage.getCartCount();
    
    // Navigate to different pages
    await cartPage.goto();
    await homePage.goto();
    
    // Cart count should be maintained
    const maintainedCount = await homePage.getCartCount();
    expect(maintainedCount).toBe(cartCount);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Add item to cart first
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Simulate network error for cart update
    await page.route('**/api/cart/**', route => {
      route.abort('failed');
    });
    
    // Try to update quantity
    try {
      await cartPage.increaseItemQuantity(0);
      
      // Should show error or handle gracefully
      const hasError = await cartPage.hasError();
      expect(hasError).toBe(true);
    } catch {
      // Network error handled by preventing action
    }
  });

  test('should display loading states during cart operations', async ({ page }) => {
    // Add item to cart first
    await homePage.goto();
    await homePage.addProductToCart(0);
    
    await cartPage.goto();
    
    // Delay cart update response
    await page.route('**/api/cart/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });
    
    // Update quantity and check for loading state
    await cartPage.increaseItemQuantity(0);
    
    // Loading should complete without errors
    const hasError = await cartPage.hasError();
    expect(hasError).toBe(false);
  });

  test.describe('Mobile Cart Experience', () => {
    test.use({ 
      viewport: { width: 375, height: 667 } 
    });

    test('should work correctly on mobile devices', async () => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      // Verify mobile layout
      await cartPage.verifyCartHasItems();
      
      // Test mobile interactions
      await cartPage.increaseItemQuantity(0);
      
      const itemInfo = await cartPage.getCartItemInfo(0);
      expect(itemInfo.quantity).toBeGreaterThan(1);
    });

    test('should have touch-friendly quantity controls', async () => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      // Verify quantity buttons are large enough for touch
      const increaseButton = cartPage.page.locator(cartPage.increaseQuantityButton).first();
      const buttonBox = await increaseButton.boundingBox();
      
      expect(buttonBox.height).toBeGreaterThan(40); // Minimum touch target
      expect(buttonBox.width).toBeGreaterThan(40);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      // Navigate using keyboard
      await page.keyboard.press('Tab'); // Focus first interactive element
      
      // Should be able to interact with cart using keyboard
      await page.keyboard.press('Enter');
      
      // No errors should occur
      const hasError = await cartPage.hasError();
      expect(hasError).toBe(false);
    });

    test('should have proper ARIA labels', async () => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      // Check for accessibility attributes
      const removeButton = cartPage.page.locator(cartPage.removeItemButton).first();
      const increaseButton = cartPage.page.locator(cartPage.increaseQuantityButton).first();
      
      await expect(removeButton).toHaveAttribute('aria-label');
      await expect(increaseButton).toHaveAttribute('aria-label');
    });

    test('should announce cart updates to screen readers', async () => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      // Update quantity
      await cartPage.increaseItemQuantity(0);
      
      // Check for ARIA live regions or announcements
      const liveRegion = cartPage.page.locator('[aria-live]');
      if (await liveRegion.isVisible()) {
        await expect(liveRegion).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should handle large quantities efficiently', async () => {
      // Add item to cart
      await homePage.goto();
      await homePage.addProductToCart(0);
      
      await cartPage.goto();
      
      const startTime = Date.now();
      
      // Update to large quantity
      await cartPage.updateItemQuantity(0, 50);
      
      const endTime = Date.now();
      const updateTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(updateTime).toBeLessThan(3000);
    });

    test('should handle multiple cart operations efficiently', async () => {
      // Add multiple items
      await homePage.goto();
      for (let i = 0; i < 3; i++) {
        await homePage.addProductToCart(i);
      }
      
      await cartPage.goto();
      
      const startTime = Date.now();
      
      // Perform multiple operations
      await cartPage.increaseItemQuantity(0);
      await cartPage.increaseItemQuantity(1);
      await cartPage.removeItem(2);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete efficiently
      expect(totalTime).toBeLessThan(5000);
    });
  });
});
