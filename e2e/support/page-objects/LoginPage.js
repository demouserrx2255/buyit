const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * Login Page Object
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Login page specific selectors
    this.emailInput = '[data-testid="email-input"]';
    this.passwordInput = '[data-testid="password-input"]';
    this.loginButton = '[data-testid="login-button"]';
    this.registerLink = '[data-testid="register-link"]';
    this.forgotPasswordLink = '[data-testid="forgot-password-link"]';
    this.loginForm = '[data-testid="login-form"]';
    this.rememberMeCheckbox = '[data-testid="remember-me"]';
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await super.goto('/login');
    await this.waitForElement(this.loginForm);
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLogin() {
    await this.page.click(this.loginButton);
    await this.waitForLoading();
  }

  /**
   * Perform complete login
   */
  async login(email, password) {
    await this.fillLoginForm(email, password);
    await this.clickLogin();
  }

  /**
   * Quick login with test user
   */
  async loginAsTestUser() {
    await this.login('customer1@test.com', 'Test123!');
  }

  /**
   * Click register link
   */
  async goToRegister() {
    await this.page.click(this.registerLink);
    await this.waitForPageLoad();
  }

  /**
   * Click forgot password link
   */
  async goToForgotPassword() {
    await this.page.click(this.forgotPasswordLink);
    await this.waitForPageLoad();
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe() {
    await this.page.click(this.rememberMeCheckbox);
  }

  /**
   * Verify login form is displayed
   */
  async verifyLoginFormDisplayed() {
    await expect(this.page.locator(this.loginForm)).toBeVisible();
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.loginButton)).toBeVisible();
  }

  /**
   * Verify login button is enabled/disabled
   */
  async verifyLoginButtonState(enabled = true) {
    const loginBtn = this.page.locator(this.loginButton);
    if (enabled) {
      await expect(loginBtn).toBeEnabled();
    } else {
      await expect(loginBtn).toBeDisabled();
    }
  }

  /**
   * Get email input value
   */
  async getEmailValue() {
    return await this.page.inputValue(this.emailInput);
  }

  /**
   * Get password input value
   */
  async getPasswordValue() {
    return await this.page.inputValue(this.passwordInput);
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.page.fill(this.emailInput, '');
    await this.page.fill(this.passwordInput, '');
  }

  /**
   * Verify validation error for email
   */
  async verifyEmailValidationError(expectedMessage) {
    const errorElement = this.page.locator('[data-testid="email-error"]');
    await expect(errorElement).toContainText(expectedMessage);
  }

  /**
   * Verify validation error for password
   */
  async verifyPasswordValidationError(expectedMessage) {
    const errorElement = this.page.locator('[data-testid="password-error"]');
    await expect(errorElement).toContainText(expectedMessage);
  }

  /**
   * Verify successful login (redirect to home)
   */
  async verifySuccessfulLogin() {
    // Should redirect to home page
    await this.verifyURL('/');
    // User should be logged in
    await expect(this.isLoggedIn()).resolves.toBe(true);
  }

  /**
   * Verify login failure
   */
  async verifyLoginFailure() {
    // Should stay on login page
    await this.verifyURL('/login');
    // Should show error message
    await expect(this.hasError()).resolves.toBe(true);
  }

  /**
   * Test invalid email formats
   */
  async testInvalidEmailFormats() {
    const invalidEmails = [
      'invalid-email',
      '@test.com',
      'test@',
      'test..test@test.com',
      ''
    ];

    for (const email of invalidEmails) {
      await this.clearForm();
      await this.page.fill(this.emailInput, email);
      await this.page.fill(this.passwordInput, 'Test123!');
      
      // Try to submit (should be prevented by validation)
      await this.clickLogin();
      
      // Should still be on login page
      await this.verifyURL('/login');
    }
  }

  /**
   * Test password requirements
   */
  async testPasswordRequirements() {
    const weakPasswords = [
      '',
      '123',
      'password',
      'PASSWORD',
      '12345678'
    ];

    for (const password of weakPasswords) {
      await this.clearForm();
      await this.page.fill(this.emailInput, 'test@test.com');
      await this.page.fill(this.passwordInput, password);
      
      await this.clickLogin();
      
      // Should show validation error or stay on login page
      const isStillOnLogin = await this.getCurrentURL().then(url => url.includes('/login'));
      expect(isStillOnLogin).toBe(true);
    }
  }
}

module.exports = LoginPage;
