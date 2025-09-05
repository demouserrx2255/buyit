const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

/**
 * Cart Page Object
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);

    // Cart page specific selectors
    this.cartContainer = '[data-testid="cart-container"]';
    this.cartItems = '[data-testid="cart-item"]';
    this.cartItemName = '[data-testid="cart-item-name"]';
    this.cartItemPrice = '[data-testid="cart-item-price"]';
    this.cartItemQuantity = '[data-testid="cart-item-quantity"]';
    this.cartItemTotal = '[data-testid="cart-item-total"]';
    this.quantityInput = '[data-testid="quantity-input"]';
    this.increaseQuantityButton = '[data-testid="increase-quantity"]';
    this.decreaseQuantityButton = '[data-testid="decrease-quantity"]';
    this.removeItemButton = '[data-testid="remove-item"]';
    this.cartSubtotal = '[data-testid="cart-subtotal"]';
    this.cartTax = '[data-testid="cart-tax"]';
    this.cartTotal = '[data-testid="cart-total"]';
    this.checkoutButton = '[data-testid="checkout-button"]';
    this.continueShoppingButton = '[data-testid="continue-shopping"]';
    this.emptyCartMessage = '[data-testid="empty-cart-message"]';
    this.clearCartButton = '[data-testid="clear-cart"]';
    this.couponInput = '[data-testid="coupon-input"]';
    this.applyCouponButton = '[data-testid="apply-coupon"]';

    // New: Address modal selectors
    this.addressModal = '[data-testid="address-modal"]';
    this.addressForm = '[data-testid="address-form"]';
    this.inputStreet = '[data-testid="input-street"]';
    this.inputCity = '[data-testid="input-city"]';
    this.inputState = '[data-testid="input-state"]';
    this.inputZipCode = '[data-testid="input-zipCode"]';
    this.selectPaymentMethod = '[data-testid="select-payment-method"]';
    this.cancelAddressButton = '[data-testid="cancel-address"]';
    this.confirmPaymentButton = '[data-testid="confirm-payment"]';
  }

  async fillCheckoutForm(userData) {
    const {
      inputStreet,
      inputCity,
      inputState,
      inputZipCode,
      selectPaymentMethod,
    } = userData;
    await this.page.fill(this.inputStreet, inputStreet);
    await this.page.fill(this.inputCity, inputCity);
    await this.page.fill(this.inputState, inputState);
    await this.page.fill(this.inputZipCode, inputZipCode);
    await this.page.selectOption(this.selectPaymentMethod, selectPaymentMethod);
    await this.page.click(this.confirmPaymentButton);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.page.click(this.checkoutButton);
    await this.waitForPageLoad();
  }

  /**
   * Continue shopping
   */
  async continueShopping() {
    await this.page.click(this.continueShoppingButton);
    await this.waitForPageLoad();
  }
}

module.exports = CartPage;
