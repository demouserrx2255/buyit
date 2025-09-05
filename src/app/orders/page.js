"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import RequireAuth from "../components/RequireAuth";
import Image from "next/image";
import { getImageUrl } from "../../lib/utils";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <RequireAuth>
      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              aria-label="Close"
            >
              ✕
            </button>

            <h2
              className="text-2xl font-bold text-gray-900 mb-2"
              data-testid="success-message"
            >
              Order #{selectedOrder._id}
            </h2>

            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>
                Status:{" "}
                <span className="font-medium text-gray-800 capitalize">
                  {selectedOrder.status}
                </span>
              </p>
              <p>
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
              <p>
                Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-4" data-testid="order-id">
              {selectedOrder.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 border p-4 rounded-md bg-gray-50 shadow-sm"
                >
                  <img
                    src={getImageUrl(item.product?.images?.[0])}
                    alt={item.product?.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.product?.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      Category:{" "}
                      <span className="font-semibold">
                        {item.product?.category}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ${item.price} × {item.quantity} ={" "}
                      <span className="font-medium">
                        ${item.price * item.quantity}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-4">
              Total: ${selectedOrder.totalAmount}
            </p>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

        {status === "loading" && (
          <p className="text-gray-600">Loading your orders...</p>
        )}
        {error && <p className="text-red-600">{error}</p>}

        {items.length === 0 && status !== "loading" && (
          <p className="text-gray-500">You have no orders yet.</p>
        )}

        <ul className="space-y-4">
          {items.map((order) => (
            <li
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p
                    className="text-gray-800 font-semibold"
                    data-testid="order-id"
                  >
                    Order #{order._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items.length} items • ${order.totalAmount}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <span
                  className={`text-sm px-2 py-1 rounded-md ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </RequireAuth>
  );
}

// Optional: Add color-coding for status
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
