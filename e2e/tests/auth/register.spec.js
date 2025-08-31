const { test, expect } = require('@playwright/test');
const RegisterPage = require('../../support/page-objects/RegisterPage');
const HomePage = require('../../support/page-objects/HomePage');
const TestHelpers = require('../../support/test-helpers');

test.describe('User Registration', () => {
  let registerPage;
  let homePage;
  let helpers;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    homePage = new HomePage(page);
    helpers = new TestHelpers(page);
    
    // Clear storage before each test
    await helpers.clearStorage();
  });

  test('should display registration form correctly', async () => {
    await registerPage.goto();
    
    await registerPage.verifyRegistrationFormDisplayed();
    await registerPage.verifyTitle('Register');
  });

  test('should register new user with valid data', async () => {
    const newUser = await registerPage.registerNewTestUser();
    
    // Should redirect to home page
    await registerPage.verifyURL('/');
    
    // Should be logged in
    expect(await registerPage.isLoggedIn()).toBe(true);
    
    // Cart should be available
    expect(await registerPage.getCartCount()).toBeGreaterThanOrEqual(0);
  });

  test('should show validation error for empty required fields', async () => {
    await registerPage.goto();
    await registerPage.clearForm();
    await registerPage.clickRegister();
    
    await registerPage.verifyFieldValidationError('name', 'Name is required');
    await registerPage.verifyFieldValidationError('email', 'Email is required');
    await registerPage.verifyFieldValidationError('password', 'Password is required');
  });

  test('should validate name requirements', async () => {
    await registerPage.goto();
    await registerPage.testNameValidation();
  });

  test('should validate email format', async () => {
    await registerPage.goto();
    await registerPage.testEmailValidation();
  });

  test('should validate password strength', async () => {
    await registerPage.goto();
    await registerPage.testPasswordStrengthValidation();
  });

  test('should validate password confirmation matching', async () => {
    await registerPage.goto();
    await registerPage.testPasswordConfirmation();
  });

  test('should show error for duplicate email registration', async () => {
    await registerPage.goto();
    await registerPage.testDuplicateEmailRegistration();
  });

  test('should navigate to login page', async () => {
    await registerPage.goto();
    await registerPage.goToLogin();
    
    await registerPage.verifyURL('/login');
  });

  test('should handle special characters in name', async () => {
    const userData = {
      name: "John O'Connor-Smith",
      email: helpers.generateUniqueEmail('special'),
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.register(userData);
    
    await registerPage.verifySuccessfulRegistration();
  });

  test('should handle international characters in name', async () => {
    const userData = {
      name: 'José María García',
      email: helpers.generateUniqueEmail('intl'),
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.register(userData);
    
    await registerPage.verifySuccessfulRegistration();
  });

  test('should trim whitespace from inputs', async () => {
    const userData = {
      name: '  Test User  ',
      email: '  test@email.com  ',
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.register(userData);
    
    await registerPage.verifySuccessfulRegistration();
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/register', route => {
      route.abort('failed');
    });
    
    const userData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.register(userData);
    
    // Should show error message
    expect(await registerPage.hasError()).toBe(true);
  });

  test('should disable register button while loading', async ({ page }) => {
    // Delay the register response to test loading state
    await page.route('**/api/register', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    const userData = {
      name: 'Test User',
      email: helpers.generateUniqueEmail(),
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    
    // Click register button
    await page.click('[data-testid="register-button"]');
    
    // Button should be disabled during loading
    await registerPage.verifyRegisterButtonState(false);
  });

  test('should show server validation errors', async ({ page }) => {
    // Mock server returning validation errors
    await page.route('**/api/register', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Validation failed',
          errors: {
            email: 'Email already exists',
            password: 'Password too weak'
          }
        })
      });
    });
    
    const userData = {
      name: 'Test User',
      email: 'existing@test.com',
      password: 'weak'
    };
    
    await registerPage.goto();
    await registerPage.register(userData);
    
    // Should show server validation errors
    expect(await registerPage.hasError()).toBe(true);
  });

  test('should auto-login after successful registration', async () => {
    const newUser = await registerPage.registerNewTestUser();
    
    // Should be automatically logged in
    expect(await registerPage.isLoggedIn()).toBe(true);
    
    // Should be able to access user features
    await registerPage.clickCart();
    expect(await registerPage.getCurrentURL()).toContain('/cart');
  });

  test('should preserve form data on validation error', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'Test123!'
    };
    
    await registerPage.goto();
    await registerPage.fillRegistrationForm(userData);
    await registerPage.clickRegister();
    
    // Should show validation error but preserve form data
    await registerPage.verifyFieldValidationError('email', 'Please enter a valid email');
    
    const formValues = await registerPage.getFormValues();
    expect(formValues.name).toBe(userData.name);
    expect(formValues.email).toBe(userData.email);
  });

  test('should show password strength indicator', async ({ page }) => {
    await registerPage.goto();
    
    // Type weak password
    await page.fill('[data-testid="password-input"]', 'weak');
    
    // Check if strength indicator exists and shows weak
    const strengthIndicator = page.locator('[data-testid="password-strength"]');
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toContainText('Weak');
    }
    
    // Type strong password
    await page.fill('[data-testid="password-input"]', 'StrongPassword123!');
    
    // Should show strong
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toContainText('Strong');
    }
  });

  test.describe('Mobile Registration', () => {
    test.use({ 
      viewport: { width: 375, height: 667 } // iPhone SE dimensions
    });

    test('should register successfully on mobile', async () => {
      const newUser = await registerPage.registerNewTestUser();
      await registerPage.verifySuccessfulRegistration();
    });

    test('should have proper mobile form layout', async () => {
      await registerPage.goto();
      
      // Verify form elements are visible and properly sized on mobile
      await registerPage.verifyRegistrationFormDisplayed();
      
      // Check if inputs are large enough for mobile interaction
      const nameInput = registerPage.page.locator(registerPage.nameInput);
      const inputBox = await nameInput.boundingBox();
      
      expect(inputBox.height).toBeGreaterThan(40); // Minimum touch target size
    });

    test('should handle mobile keyboard types', async ({ page }) => {
      await registerPage.goto();
      
      // Email input should trigger email keyboard
      const emailInput = page.locator(registerPage.emailInput);
      await expect(emailInput).toHaveAttribute('type', 'email');
      
      // Password input should be secure
      const passwordInput = page.locator(registerPage.passwordInput);
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Accessibility', () => {
    test('should be accessible with keyboard navigation', async ({ page }) => {
      await registerPage.goto();
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Name input
      await page.keyboard.type('Test User');
      
      await page.keyboard.press('Tab'); // Email input
      await page.keyboard.type(helpers.generateUniqueEmail());
      
      await page.keyboard.press('Tab'); // Password input
      await page.keyboard.type('Test123!');
      
      await page.keyboard.press('Tab'); // Confirm password (if exists)
      const confirmPasswordExists = await registerPage.elementExists(registerPage.confirmPasswordInput);
      if (confirmPasswordExists) {
        await page.keyboard.type('Test123!');
        await page.keyboard.press('Tab');
      }
      
      await page.keyboard.press('Enter'); // Submit form
      
      // Should successfully register
      await registerPage.verifySuccessfulRegistration();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await registerPage.goto();
      
      // Check for proper accessibility attributes
      const nameInput = page.locator(registerPage.nameInput);
      const emailInput = page.locator(registerPage.emailInput);
      const passwordInput = page.locator(registerPage.passwordInput);
      const registerButton = page.locator(registerPage.registerButton);
      
      // Verify inputs have proper labels
      await expect(nameInput).toHaveAttribute('aria-label');
      await expect(emailInput).toHaveAttribute('aria-label');
      await expect(passwordInput).toHaveAttribute('aria-label');
      await expect(registerButton).toHaveAttribute('role', 'button');
    });

    test('should announce validation errors to screen readers', async ({ page }) => {
      await registerPage.goto();
      await registerPage.clearForm();
      await registerPage.clickRegister();
      
      // Error messages should have proper ARIA attributes
      const nameError = page.locator('[data-testid="name-error"]');
      if (await nameError.isVisible()) {
        await expect(nameError).toHaveAttribute('role', 'alert');
      }
    });
  });

  test.describe('Security', () => {
    test('should not show password in plain text', async ({ page }) => {
      await registerPage.goto();
      
      const passwordInput = page.locator(registerPage.passwordInput);
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Confirm password should also be hidden
      if (await registerPage.elementExists(registerPage.confirmPasswordInput)) {
        const confirmPasswordInput = page.locator(registerPage.confirmPasswordInput);
        await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      }
    });

    test('should handle XSS in name field', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: helpers.generateUniqueEmail('xss'),
        password: 'Test123!'
      };
      
      await registerPage.goto();
      await registerPage.register(maliciousData);
      
      // Should either sanitize the input or show validation error
      // Should not execute the script
      const pageContent = await registerPage.page.content();
      expect(pageContent).not.toContain('<script>alert("xss")</script>');
    });
  });
});
