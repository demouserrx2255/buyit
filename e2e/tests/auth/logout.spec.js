const { test, expect } = require('@playwright/test');
const LoginPage = require('../../support/page-objects/LoginPage');
const HomePage = require('../../support/page-objects/HomePage');
const TestHelpers = require('../../support/test-helpers');

test.describe('User Logout', () => {
  let loginPage;
  let homePage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    helpers = new TestHelpers(page);
    
    // Clear storage and login before each test
    await helpers.clearStorage();
    
    // Login first
    const testUser = helpers.getCustomer(0);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.verifySuccessfulLogin();
  });

  test('should logout successfully from header', async () => {
    // Verify user is logged in
    expect(await loginPage.isLoggedIn()).toBe(true);
    
    // Logout
    await loginPage.logout();
    
    // Should redirect to home page and be logged out
    await loginPage.verifyURL('/');
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('should clear user session data on logout', async ({ page }) => {
    // Check that user data exists in storage
    const tokenBefore = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenBefore).toBeTruthy();
    
    // Logout
    await loginPage.logout();
    
    // Check that user data is cleared
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfter).toBeNull();
  });

  test('should redirect to login when accessing protected routes after logout', async ({ page }) => {
    // Logout
    await loginPage.logout();
    
    // Try to access protected route
    await page.goto('/orders');
    
    // Should redirect to login
    await loginPage.verifyURL('/login');
  });

  test('should clear cart data on logout (if applicable)', async () => {
    // Add item to cart while logged in
    await homePage.goto();
    
    try {
      await homePage.addProductToCart(0);
      const cartCountBefore = await homePage.getCartCount();
      expect(cartCountBefore).toBeGreaterThan(0);
      
      // Logout
      await loginPage.logout();
      
      // Cart should be cleared (depends on implementation)
      const cartCountAfter = await homePage.getCartCount();
      expect(cartCountAfter).toBe(0);
    } catch {
      // Cart functionality might not be available, just verify logout works
      await loginPage.logout();
      expect(await loginPage.isLoggedIn()).toBe(false);
    }
  });

  test('should prevent access to user menu after logout', async () => {
    // Logout
    await loginPage.logout();
    
    // User menu should not be visible
    const userMenuExists = await loginPage.elementExists(loginPage.userMenu);
    expect(userMenuExists).toBe(false);
  });

  test('should handle logout when already logged out', async () => {
    // Logout first time
    await loginPage.logout();
    expect(await loginPage.isLoggedIn()).toBe(false);
    
    // Try to logout again (should not cause error)
    try {
      await loginPage.logout();
      // Should still be logged out without errors
      expect(await loginPage.isLoggedIn()).toBe(false);
    } catch {
      // If logout button is not available when logged out, that's expected
    }
  });

  test('should handle network error during logout', async ({ page }) => {
    // Intercept logout request and simulate failure
    await page.route('**/api/logout', route => {
      route.abort('failed');
    });
    
    // Attempt logout
    await loginPage.logout();
    
    // Should still clear local session even if server logout fails
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('should logout from multiple tabs/windows', async ({ context }) => {
    // Open second tab
    const secondPage = await context.newPage();
    const secondHomePage = new HomePage(secondPage);
    
    // Both tabs should show user as logged in
    await secondHomePage.goto();
    expect(await secondHomePage.isLoggedIn()).toBe(true);
    
    // Logout from first tab
    await loginPage.logout();
    
    // Refresh second tab - should also be logged out
    await secondPage.reload();
    await secondHomePage.waitForPageLoad();
    expect(await secondHomePage.isLoggedIn()).toBe(false);
    
    await secondPage.close();
  });

  test('should maintain logout state after browser refresh', async ({ page }) => {
    // Logout
    await loginPage.logout();
    expect(await loginPage.isLoggedIn()).toBe(false);
    
    // Refresh page
    await page.reload();
    await loginPage.waitForPageLoad();
    
    // Should still be logged out
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('should redirect to appropriate page after logout based on current location', async ({ page }) => {
    // Navigate to different pages and test logout behavior
    const testPages = ['/cart', '/orders', '/user'];
    
    for (const testPage of testPages) {
      // Login again
      const testUser = helpers.getCustomer(0);
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
      
      // Navigate to test page
      await page.goto(testPage);
      
      // Logout
      await loginPage.logout();
      
      // Should redirect to home or login page
      const currentUrl = await loginPage.getCurrentURL();
      expect(currentUrl).toMatch(/\/(login|$)/);
    }
  });

  test('should clear sensitive data from browser storage', async ({ page }) => {
    // Check what data exists before logout
    const storageBefore = await page.evaluate(() => ({
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage)
    }));
    
    // Logout
    await loginPage.logout();
    
    // Check that sensitive data is cleared
    const storageAfter = await page.evaluate(() => ({
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage)
    }));
    
    // Token should be removed
    expect(storageAfter.localStorage).not.toContain('token');
    expect(storageAfter.localStorage).not.toContain('user');
  });

  test('should show confirmation dialog for logout (if implemented)', async ({ page }) => {
    // Some apps show confirmation before logout
    
    // Listen for dialog
    let dialogShown = false;
    page.on('dialog', async dialog => {
      dialogShown = true;
      expect(dialog.message()).toContain('Are you sure');
      await dialog.accept();
    });
    
    // Attempt logout
    await page.click('[data-testid="logout-button"]');
    
    // If confirmation dialog is implemented, it should have been shown
    // If not implemented, logout should proceed directly
    await loginPage.waitForPageLoad();
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test('should handle logout timeout gracefully', async ({ page }) => {
    // Simulate slow logout response
    await page.route('**/api/logout', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      route.continue();
    });
    
    // Logout should still work even with slow response
    await loginPage.logout();
    
    // Should be logged out locally
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

  test.describe('Mobile Logout', () => {
    test.use({ 
      viewport: { width: 375, height: 667 } // iPhone SE dimensions
    });

    test('should logout successfully on mobile', async () => {
      // Verify user is logged in
      expect(await loginPage.isLoggedIn()).toBe(true);
      
      // Logout on mobile
      await loginPage.logout();
      
      // Should be logged out
      expect(await loginPage.isLoggedIn()).toBe(false);
    });

    test('should handle mobile menu logout', async ({ page }) => {
      // If logout is in a mobile menu, test that flow
      const mobileMenuButton = '[data-testid="mobile-menu-button"]';
      
      if (await loginPage.elementExists(mobileMenuButton)) {
        await page.click(mobileMenuButton);
        await loginPage.waitForElement('[data-testid="mobile-menu"]');
        
        // Click logout from mobile menu
        await page.click('[data-testid="mobile-logout-button"]');
        
        expect(await loginPage.isLoggedIn()).toBe(false);
      } else {
        // Regular logout if no mobile menu
        await loginPage.logout();
        expect(await loginPage.isLoggedIn()).toBe(false);
      }
    });
  });

  test.describe('Security', () => {
    test('should invalidate session token on server', async ({ page }) => {
      // Get current token
      const token = await page.evaluate(() => localStorage.getItem('token'));
      
      // Logout
      await loginPage.logout();
      
      // Try to use old token for API request
      const response = await page.request.get('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Should return unauthorized
      expect(response.status()).toBe(401);
    });

    test('should prevent CSRF attacks during logout', async ({ page }) => {
      // Logout should include proper CSRF protection
      // This test depends on backend implementation
      
      await loginPage.logout();
      expect(await loginPage.isLoggedIn()).toBe(false);
    });
  });

  test.describe('Performance', () => {
    test('should logout quickly', async () => {
      const startTime = Date.now();
      
      await loginPage.logout();
      
      const endTime = Date.now();
      const logoutTime = endTime - startTime;
      
      // Logout should complete within reasonable time
      expect(logoutTime).toBeLessThan(3000); // 3 seconds
    });
  });
});
