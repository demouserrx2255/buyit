const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

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
  }

  /**
   * Navigate to cart page
   */
  async goto() {
    await super.goto('/cart');
    await this.waitForElement(this.cartContainer);
  }

  /**
   * Get all cart items
   */
  async getCartItems() {
    return this.page.locator(this.cartItems);
  }

  /**
   * Get cart items count
   */
  async getCartItemsCount() {
    const items = await this.getCartItems();
    return await items.count();
  }

  /**
   * Get cart item information by index
   */
  async getCartItemInfo(index = 0) {
    const items = await this.getCartItems();
    const item = items.nth(index);
    
    const name = await item.locator(this.cartItemName).textContent();
    const price = await item.locator(this.cartItemPrice).textContent();
    const quantity = await item.locator(this.cartItemQuantity).textContent();
    const total = await item.locator(this.cartItemTotal).textContent();
    
    return {
      name: name?.trim(),
      price: price?.trim(),
      quantity: parseInt(quantity?.trim()) || 0,
      total: total?.trim()
    };
  }

  /**
   * Update item quantity by index
   */
  async updateItemQuantity(index, newQuantity) {
    const items = await this.getCartItems();
    const item = items.nth(index);
    
    const quantityInput = item.locator(this.quantityInput);
    await quantityInput.fill(newQuantity.toString());
    await this.waitForLoading();
  }

  /**
   * Increase item quantity
   */
  async increaseItemQuantity(index) {
    const items = await this.getCartItems();
    const item = items.nth(index);
    
    const increaseButton = item.locator(this.increaseQuantityButton);
    await increaseButton.click();
    await this.waitForLoading();
  }

  /**
   * Decrease item quantity
   */
  async decreaseItemQuantity(index) {
    const items = await this.getCartItems();
    const item = items.nth(index);
    
    const decreaseButton = item.locator(this.decreaseQuantityButton);
    await decreaseButton.click();
    await this.waitForLoading();
  }

  /**
   * Remove item from cart
   */
  async removeItem(index) {
    const items = await this.getCartItems();
    const item = items.nth(index);
    
    const removeButton = item.locator(this.removeItemButton);
    await removeButton.click();
    await this.waitForLoading();
  }

  /**
   * Remove item by name
   */
  async removeItemByName(productName) {
    const item = this.page.locator(this.cartItems)
      .filter({ hasText: productName });
    
    const removeButton = item.locator(this.removeItemButton);
    await removeButton.click();
    await this.waitForLoading();
  }

  /**
   * Get cart totals
   */
  async getCartTotals() {
    const subtotal = await this.page.locator(this.cartSubtotal).textContent();
    const tax = await this.elementExists(this.cartTax) 
      ? await this.page.locator(this.cartTax).textContent()
      : '$0.00';
    const total = await this.page.locator(this.cartTotal).textContent();
    
    return {
      subtotal: subtotal?.trim(),
      tax: tax?.trim(),
      total: total?.trim()
    };
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

  /**
   * Clear entire cart
   */
  async clearCart() {
    if (await this.elementExists(this.clearCartButton)) {
      await this.page.click(this.clearCartButton);
      
      // Handle confirmation dialog if it appears
      this.page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await this.waitForLoading();
    }
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode) {
    if (await this.elementExists(this.couponInput)) {
      await this.page.fill(this.couponInput, couponCode);
      await this.page.click(this.applyCouponButton);
      await this.waitForLoading();
    }
  }

  /**
   * Verify cart is empty
   */
  async verifyCartIsEmpty() {
    await expect(this.page.locator(this.emptyCartMessage)).toBeVisible();
    
    const itemsCount = await this.getCartItemsCount();
    expect(itemsCount).toBe(0);
  }

  /**
   * Verify cart has items
   */
  async verifyCartHasItems() {
    const itemsCount = await this.getCartItemsCount();
    expect(itemsCount).toBeGreaterThan(0);
    
    // Verify cart totals are displayed
    await expect(this.page.locator(this.cartTotal)).toBeVisible();
  }

  /**
   * Verify item exists in cart
   */
  async verifyItemInCart(productName) {
    const item = this.page.locator(this.cartItems)
      .filter({ hasText: productName });
    await expect(item).toBeVisible();
  }

  /**
   * Verify item not in cart
   */
  async verifyItemNotInCart(productName) {
    const item = this.page.locator(this.cartItems)
      .filter({ hasText: productName });
    await expect(item).not.toBeVisible();
  }

  /**
   * Verify cart total calculation
   */
  async verifyCartCalculation() {
    const itemsCount = await this.getCartItemsCount();
    let expectedSubtotal = 0;
    
    // Calculate expected subtotal
    for (let i = 0; i < itemsCount; i++) {
      const itemInfo = await this.getCartItemInfo(i);
      const price = parseFloat(itemInfo.price.replace(/[^0-9.]/g, ''));
      expectedSubtotal += price * itemInfo.quantity;
    }
    
    const totals = await this.getCartTotals();
    const actualSubtotal = parseFloat(totals.subtotal.replace(/[^0-9.]/g, ''));
    
    expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);
  }

  /**
   * Verify quantity controls work
   */
  async verifyQuantityControls(index = 0) {
    const initialInfo = await this.getCartItemInfo(index);
    const initialQuantity = initialInfo.quantity;
    
    // Increase quantity
    await this.increaseItemQuantity(index);
    const increasedInfo = await this.getCartItemInfo(index);
    expect(increasedInfo.quantity).toBe(initialQuantity + 1);
    
    // Decrease quantity
    await this.decreaseItemQuantity(index);
    const decreasedInfo = await this.getCartItemInfo(index);
    expect(decreasedInfo.quantity).toBe(initialQuantity);
  }

  /**
   * Test removing items from cart
   */
  async testRemoveItem(index = 0) {
    const initialCount = await this.getCartItemsCount();
    const itemInfo = await this.getCartItemInfo(index);
    
    await this.removeItem(index);
    
    // Verify item count decreased
    const newCount = await this.getCartItemsCount();
    expect(newCount).toBe(initialCount - 1);
    
    // Verify specific item is removed
    await this.verifyItemNotInCart(itemInfo.name);
  }

  /**
   * Test cart persistence
   */
  async testCartPersistence() {
    const itemsCount = await this.getCartItemsCount();
    const totals = await this.getCartTotals();
    
    // Refresh page
    await this.page.reload();
    await this.waitForPageLoad();
    
    // Verify cart state is preserved
    const newItemsCount = await this.getCartItemsCount();
    const newTotals = await this.getCartTotals();
    
    expect(newItemsCount).toBe(itemsCount);
    expect(newTotals.total).toBe(totals.total);
  }

  /**
   * Test checkout button accessibility
   */
  async verifyCheckoutButtonState() {
    const itemsCount = await this.getCartItemsCount();
    const checkoutBtn = this.page.locator(this.checkoutButton);
    
    if (itemsCount > 0) {
      await expect(checkoutBtn).toBeEnabled();
    } else {
      await expect(checkoutBtn).toBeDisabled();
    }
  }

  /**
   * Test maximum quantity limits
   */
  async testQuantityLimits(index = 0) {
    // Try to set very high quantity
    await this.updateItemQuantity(index, 9999);
    
    // Should either accept the quantity or show validation error
    const itemInfo = await this.getCartItemInfo(index);
    // Quantity should be reasonable (implementation dependent)
    expect(itemInfo.quantity).toBeLessThanOrEqual(100);
  }

  /**
   * Test negative quantity handling
   */
  async testNegativeQuantity(index = 0) {
    const initialInfo = await this.getCartItemInfo(index);
    
    // Try to set negative quantity
    await this.updateItemQuantity(index, -1);
    
    // Should either remove item or set to minimum (1)
    const newCount = await this.getCartItemsCount();
    
    if (newCount === 0) {
      // Item was removed
      await this.verifyItemNotInCart(initialInfo.name);
    } else {
      // Quantity was set to minimum
      const newInfo = await this.getCartItemInfo(index);
      expect(newInfo.quantity).toBeGreaterThan(0);
    }
  }
}

module.exports = CartPage;
