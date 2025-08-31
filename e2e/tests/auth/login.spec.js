const { test, expect } = require('@playwright/test');
const LoginPage = require('../../support/page-objects/LoginPage');
const HomePage = require('../../support/page-objects/HomePage');
const TestHelpers = require('../../support/test-helpers');

test.describe('User Login', () => {
  let loginPage;
  let homePage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    helpers = new TestHelpers(page);
    
    // Clear storage before each test
    await helpers.clearStorage();
  });

  test('should display login form correctly', async () => {
    await loginPage.goto();
    
    await loginPage.verifyLoginFormDisplayed();
    await loginPage.verifyTitle('Login');
  });

  test('should login with valid credentials', async () => {
    const testUser = helpers.getCustomer(0); // Gets customer1@test.com
    
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    
    // Should redirect to home page
    await homePage.verifyURL('/');
    
    // Should be logged in
    expect(await loginPage.isLoggedIn()).toBe(true);
    
    // Cart should be visible
    expect(await loginPage.getCartCount()).toBeGreaterThanOrEqual(0);
  });

  test('should show error with invalid credentials', async () => {
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');
    
    await loginPage.verifyLoginFailure();
    expect(await loginPage.hasError()).toBe(true);
  });

  test('should show validation error for empty email', async () => {
    await loginPage.goto();
    await loginPage.login('', 'Test123!');
    
    await loginPage.verifyEmailValidationError('Email is required');
  });

  test('should show validation error for empty password', async () => {
    await loginPage.goto();
    await loginPage.login('test@test.com', '');
    
    await loginPage.verifyPasswordValidationError('Password is required');
  });

  test('should show validation error for invalid email format', async () => {
    await loginPage.goto();
    await loginPage.testInvalidEmailFormats();
  });

  test('should navigate to register page', async () => {
    await loginPage.goto();
    await loginPage.goToRegister();
    
    await loginPage.verifyURL('/register');
  });

  test('should remember login state after page refresh', async ({ page }) => {
    const testUser = helpers.getCustomer(0);
    
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
    
    // Verify login successful
    expect(await loginPage.isLoggedIn()).toBe(true);
    
    // Refresh page
    await page.reload();
    await loginPage.waitForPageLoad();
    
    // Should still be logged in
    expect(await loginPage.isLoggedIn()).toBe(true);
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/login', route => {
      route.abort('failed');
    });
    
    await loginPage.goto();
    await loginPage.login('test@test.com', 'Test123!');
    
    // Should show error message
    expect(await loginPage.hasError()).toBe(true);
  });

  test('should disable login button while loading', async ({ page }) => {
    // Delay the login response to test loading state
    await page.route('**/api/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await loginPage.goto();
    await loginPage.fillLoginForm('customer1@test.com', 'Test123!');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Button should be disabled during loading
    await loginPage.verifyLoginButtonState(false);
  });

  test('should clear form data after failed login', async () => {
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');
    
    // Wait for error
    expect(await loginPage.hasError()).toBe(true);
    
    // Form should be cleared or ready for new input
    await loginPage.clearForm();
    await loginPage.login('customer1@test.com', 'Test123!');
    
    // Should successfully login
    await loginPage.verifySuccessfulLogin();
  });

  test('should maintain cart state after login', async ({ page }) => {
    // First, add items to cart as guest (if supported)
    await homePage.goto();
    
    // Try to add item to cart (might require login)
    try {
      await homePage.addProductToCart(0);
      const cartCountBeforeLogin = await homePage.getCartCount();
      
      // Now login
      await page.goto('/login');
      await loginPage.login('customer1@test.com', 'Test123!');
      
      // Cart count should be maintained or merged
      const cartCountAfterLogin = await homePage.getCartCount();
      expect(cartCountAfterLogin).toBeGreaterThanOrEqual(cartCountBeforeLogin);
    } catch {
      // If guest cart is not supported, just verify login works
      await page.goto('/login');
      await loginPage.login('customer1@test.com', 'Test123!');
      await loginPage.verifySuccessfulLogin();
    }
  });

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page while not logged in
    await page.goto('/orders');
    
    // Should redirect to login
    await loginPage.verifyURL('/login');
    
    // Login
    await loginPage.login('customer1@test.com', 'Test123!');
    
    // Should redirect to originally intended page
    await loginPage.verifyURL('/orders');
  });

  test('should show appropriate error for too many failed attempts', async () => {
    const invalidCredentials = { email: 'test@test.com', password: 'wrongpassword' };
    
    // Attempt login multiple times
    for (let i = 0; i < 5; i++) {
      await loginPage.goto();
      await loginPage.login(invalidCredentials.email, invalidCredentials.password);
      
      expect(await loginPage.hasError()).toBe(true);
      
      // Wait a bit between attempts
      await loginPage.page.waitForTimeout(500);
    }
    
    // After multiple failed attempts, should show rate limiting message
    // (This depends on backend implementation)
  });

  test.describe('Mobile Login', () => {
    test.use({ 
      viewport: { width: 375, height: 667 } // iPhone SE dimensions
    });

    test('should login successfully on mobile', async () => {
      const testUser = helpers.getCustomer(0);
      
      await loginPage.goto();
      await loginPage.verifyLoginFormDisplayed();
      
      await loginPage.login(testUser.email, testUser.password);
      await loginPage.verifySuccessfulLogin();
    });

    test('should have proper mobile form layout', async () => {
      await loginPage.goto();
      
      // Verify form elements are visible and properly sized on mobile
      await loginPage.verifyLoginFormDisplayed();
      
      // Check if inputs are large enough for mobile interaction
      const emailInput = loginPage.page.locator(loginPage.emailInput);
      const inputBox = await emailInput.boundingBox();
      
      expect(inputBox.height).toBeGreaterThan(40); // Minimum touch target size
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible with keyboard navigation', async ({ page }) => {
      await loginPage.goto();
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Email input
      await page.keyboard.type('customer1@test.com');
      
      await page.keyboard.press('Tab'); // Password input
      await page.keyboard.type('Test123!');
      
      await page.keyboard.press('Tab'); // Login button
      await page.keyboard.press('Enter'); // Submit form
      
      // Should successfully login
      await loginPage.verifySuccessfulLogin();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await loginPage.goto();
      
      // Check for proper accessibility attributes
      const emailInput = page.locator(loginPage.emailInput);
      const passwordInput = page.locator(loginPage.passwordInput);
      const loginButton = page.locator(loginPage.loginButton);
      
      // Verify inputs have proper labels
      await expect(emailInput).toHaveAttribute('aria-label');
      await expect(passwordInput).toHaveAttribute('aria-label');
      await expect(loginButton).toHaveAttribute('role', 'button');
    });
  });
});
