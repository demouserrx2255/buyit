"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation"; // For redirection
import { fetchCart, removeFromCart } from "../../store/slices/cartSlice";
import { placeOrder } from "../../store/slices/ordersSlice";
import RequireAuth from "../components/RequireAuth";

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize router for navigation
  const { items, status, error } = useSelector((s) => s.cart);
  const total = items.reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0
  );
  const [isCheckout, setIsCheckout] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [isSuccess, setIsSuccess] = useState(false); // State for success loader

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const submitOrder = async () => {
    await dispatch(placeOrder({ shippingAddress, paymentMethod }));
    await dispatch(fetchCart());
    setShowAddressModal(false);
    setIsCheckout(false);
    setIsSuccess(true); // Show success loader
    setTimeout(() => {
      router.push("/orders"); // Redirect to /orderpage after 3 seconds
    }, 3000);
  };

  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white">
        {/* <h1 className="text-2xl font-semibold mb-6 text-black">Cart</h1> */}
        {status === "loading" && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {items.length === 0 ? (
          <div className="mx-auto max-w-[85rem] px-6 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-3xl font-extrabold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Add items to your cart to continue to checkout.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-black hover:text-white transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it?.product?._id}
                  className="flex items-center justify-between border rounded-md p-3 bg-white"
                >
                  <div>
                    <p className="font-medium text-black">
                      {it?.product?.name}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {it?.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-black">
                      ${(it?.product?.price || 0) * it.quantity}
                    </p>
                    <button
                      className="underline"
                      onClick={() => dispatch(removeFromCart(it?.product?._id))}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-lg font-semibold text-black">
                Total: ${total}
              </p>
              {!isCheckout ? (
                <button
                  data-testid="checkout-button"
                  className="bg-black text-white rounded px-4 py-2"
                  onClick={() => setIsCheckout(true)}
                >
                  Checkout
                </button>
              ) : (
                <button
                  className="bg-black text-white rounded px-4 py-2"
                  onClick={() => setShowAddressModal(true)}
                  data-testid="continue-shopping"
                >
                  Enter Address & Pay
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Enter Shipping Address
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  className="w-full border rounded p-2"
                  placeholder="123 Main St"
                  data-testid="input-street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className="w-full border rounded p-2"
                  placeholder="City"
                  data-testid="input-city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  className="w-full border rounded p-2"
                  placeholder="State"
                  data-testid="input-state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleAddressChange}
                  className="w-full border rounded p-2"
                  placeholder="Zip Code"
                  data-testid="input-zipCode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  data-testid="select-payment-method"
                >
                  <option value="creditCard">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cashOnDelivery">Cash on Delivery</option>
                </select>
              </div>
            </form>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="bg-gray-300 text-black rounded px-4 py-2"
                onClick={() => setShowAddressModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-black text-white rounded px-4 py-2"
                onClick={submitOrder}
                data-testid="confirm-payment"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <svg
              className="w-16 h-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m0 0a9 9 0 11-6.32 2.68A9 9 0 0112 3z"
              ></path>
            </svg>
            <p className="text-lg font-semibold text-black">
              Order Placed Successfully!
            </p>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
