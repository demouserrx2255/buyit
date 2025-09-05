const { test, expect } = require("@playwright/test");
const HomePage = require("../../support/page-objects/HomePage");
const CartPage = require("../../support/page-objects/CartPage");
const LoginPage = require("../../support/page-objects/LoginPage");
const TestHelpers = require("../../support/test-helpers");
const Productpage = require("../../support/page-objects/Productpage");
const OrderPage = require("../../support/page-objects/OrderPage");

test.describe("Cart Management", () => {
  let homePage;
  let cartPage;
  let loginPage;
  let helpers;
  let productpage;
  let orderPage;
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    loginPage = new LoginPage(page);
    helpers = new TestHelpers(page);
    productpage = new Productpage(page);
    orderPage = new OrderPage(page);
    // ✅ Navigate before trying to clear storage
    await page.goto("/");

    // Clear storage and login before each test
    await helpers.clearStorage();

    const testUser = helpers.getCustomer(0);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);
  });

  test("should complete full purchase flow and show order info", async () => {
    // Go to home page
    await homePage.goto();

    const productInfo = await homePage.getProductInfo(0);

    await homePage.clickProduct(0);

    // Should navigate to product detail page
    await homePage.verifyURL("/product/");

    await productpage.increaseQuantity();

    await productpage.addToCart();

    // // Go to cart
    await productpage.buyNow();

    // await cartPage.verifyCartHasItems();

    // // Proceed to checkout
    await cartPage.proceedToCheckout();
    await cartPage.continueShopping();

    // // Fill checkout form
    await cartPage.fillCheckoutForm({
      addressModal: "123 Test St",
      addressForm: " Test St",
      inputStreet: "23",
      inputCity: "test city",
      inputState: "test state",
      inputZipCode: "12345",
      selectPaymentMethod: "cashOnDelivery",
    });

    // // Verify redirect to order confirmation page
    await homePage.verifyURL(/orders/);

    // // Check first order info
    await orderPage.getFirstOrder();
  });
});
