const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * Register Page Object
 */
class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Register page specific selectors
    this.nameInput = '[data-testid="name-input"]';
    this.emailInput = '[data-testid="email-input"]';
    this.passwordInput = '[data-testid="password-input"]';
    this.confirmPasswordInput = '[data-testid="confirm-password-input"]';
    this.registerButton = '[data-testid="register-button"]';
    this.loginLink = '[data-testid="login-link"]';
    this.registerForm = '[data-testid="register-form"]';
    this.termsCheckbox = '[data-testid="terms-checkbox"]';
    this.privacyCheckbox = '[data-testid="privacy-checkbox"]';
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await super.goto('/register');
    await this.waitForElement(this.registerForm);
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(userData) {
    const { name, email, password, confirmPassword } = userData;
    
    await this.page.fill(this.nameInput, name);
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    
    if (confirmPassword !== undefined) {
      await this.page.fill(this.confirmPasswordInput, confirmPassword);
    } else {
      await this.page.fill(this.confirmPasswordInput, password);
    }
  }

  /**
   * Click register button
   */
  async clickRegister() {
    await this.page.click(this.registerButton);
    await this.waitForLoading();
  }

  /**
   * Perform complete registration
   */
  async register(userData) {
    await this.fillRegistrationForm(userData);
    await this.acceptTermsIfPresent();
    await this.clickRegister();
  }

  /**
   * Quick registration with generated test data
   */
  async registerNewTestUser() {
    const timestamp = Date.now();
    const userData = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@test.com`,
      password: 'Test123!'
    };
    
    await this.register(userData);
    return userData;
  }

  /**
   * Click login link
   */
  async goToLogin() {
    await this.page.click(this.loginLink);
    await this.waitForPageLoad();
  }

  /**
   * Accept terms and conditions if present
   */
  async acceptTermsIfPresent() {
    try {
      if (await this.elementExists(this.termsCheckbox)) {
        await this.page.click(this.termsCheckbox);
      }
      if (await this.elementExists(this.privacyCheckbox)) {
        await this.page.click(this.privacyCheckbox);
      }
    } catch {
      // Terms checkboxes might not be present
    }
  }

  /**
   * Verify registration form is displayed
   */
  async verifyRegistrationFormDisplayed() {
    await expect(this.page.locator(this.registerForm)).toBeVisible();
    await expect(this.page.locator(this.nameInput)).toBeVisible();
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.registerButton)).toBeVisible();
  }

  /**
   * Verify register button state
   */
  async verifyRegisterButtonState(enabled = true) {
    const registerBtn = this.page.locator(this.registerButton);
    if (enabled) {
      await expect(registerBtn).toBeEnabled();
    } else {
      await expect(registerBtn).toBeDisabled();
    }
  }

  /**
   * Clear registration form
   */
  async clearForm() {
    await this.page.fill(this.nameInput, '');
    await this.page.fill(this.emailInput, '');
    await this.page.fill(this.passwordInput, '');
    if (await this.elementExists(this.confirmPasswordInput)) {
      await this.page.fill(this.confirmPasswordInput, '');
    }
  }

  /**
   * Get form field values
   */
  async getFormValues() {
    return {
      name: await this.page.inputValue(this.nameInput),
      email: await this.page.inputValue(this.emailInput),
      password: await this.page.inputValue(this.passwordInput),
      confirmPassword: await this.elementExists(this.confirmPasswordInput) 
        ? await this.page.inputValue(this.confirmPasswordInput) 
        : null
    };
  }

  /**
   * Verify validation error for specific field
   */
  async verifyFieldValidationError(field, expectedMessage) {
    const errorElement = this.page.locator(`[data-testid="${field}-error"]`);
    await expect(errorElement).toContainText(expectedMessage);
  }

  /**
   * Verify successful registration
   */
  async verifySuccessfulRegistration() {
    // Should redirect to home page or dashboard
    await this.verifyURL('/');
    // User should be logged in
    await expect(this.isLoggedIn()).resolves.toBe(true);
  }

  /**
   * Verify registration failure
   */
  async verifyRegistrationFailure() {
    // Should stay on register page
    await this.verifyURL('/register');
    // Should show error message
    await expect(this.hasError()).resolves.toBe(true);
  }

  /**
   * Test password confirmation matching
   */
  async testPasswordConfirmation() {
    const userData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'Test123!',
      confirmPassword: 'DifferentPassword123!'
    };

    await this.fillRegistrationForm(userData);
    await this.clickRegister();

    // Should show password mismatch error
    await this.verifyFieldValidationError('confirm-password', 'Passwords do not match');
  }

  /**
   * Test duplicate email registration
   */
  async testDuplicateEmailRegistration() {
    const userData = {
      name: 'Test User',
      email: 'customer1@test.com', // Existing email from test data
      password: 'Test123!'
    };

    await this.register(userData);
    await this.verifyRegistrationFailure();
  }

  /**
   * Test form validation
   */
  async testFormValidation() {
    // Test empty form submission
    await this.clearForm();
    await this.clickRegister();
    
    // Should show validation errors for required fields
    await this.verifyFieldValidationError('name', 'Name is required');
    await this.verifyFieldValidationError('email', 'Email is required');
    await this.verifyFieldValidationError('password', 'Password is required');
  }

  /**
   * Test name validation
   */
  async testNameValidation() {
    const invalidNames = ['', 'A', 'AB']; // Too short names
    
    for (const name of invalidNames) {
      await this.clearForm();
      await this.page.fill(this.nameInput, name);
      await this.page.fill(this.emailInput, 'test@test.com');
      await this.page.fill(this.passwordInput, 'Test123!');
      
      await this.clickRegister();
      
      // Should show name validation error
      if (name === '') {
        await this.verifyFieldValidationError('name', 'Name is required');
      } else {
        await this.verifyFieldValidationError('name', 'Name must be at least 3 characters');
      }
    }
  }

  /**
   * Test email validation
   */
  async testEmailValidation() {
    const invalidEmails = [
      'invalid-email',
      '@test.com',
      'test@',
      'test..test@test.com'
    ];

    for (const email of invalidEmails) {
      await this.clearForm();
      await this.page.fill(this.nameInput, 'Test User');
      await this.page.fill(this.emailInput, email);
      await this.page.fill(this.passwordInput, 'Test123!');
      
      await this.clickRegister();
      await this.verifyFieldValidationError('email', 'Please enter a valid email');
    }
  }

  /**
   * Test password strength validation
   */
  async testPasswordStrengthValidation() {
    const weakPasswords = [
      { password: '123', error: 'Password must be at least 8 characters' },
      { password: 'password', error: 'Password must contain uppercase letter' },
      { password: 'PASSWORD', error: 'Password must contain lowercase letter' },
      { password: 'Password', error: 'Password must contain a number' }
    ];

    for (const { password, error } of weakPasswords) {
      await this.clearForm();
      await this.page.fill(this.nameInput, 'Test User');
      await this.page.fill(this.emailInput, 'test@test.com');
      await this.page.fill(this.passwordInput, password);
      
      await this.clickRegister();
      await this.verifyFieldValidationError('password', error);
    }
  }
}

module.exports = RegisterPage;
