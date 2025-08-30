"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../../store/slices/ordersSlice";
import RequireAuth from "../components/RequireAuth";
import OrderDetailsModal from "../components/OrderDetailsModal";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <RequireAuth>
      <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white">
        <h1 className="text-2xl font-semibold mb-6 text-black">My Orders</h1>
        {status === "loading" && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <ul className="space-y-3">
          {items.map((o) => (
            <li
              key={o._id}
              className="border rounded-md p-3 bg-white cursor-pointer"
              onClick={() => handleOrderClick(o)}
            >
              <p className="text-black font-medium">Order #{o._id}</p>
              <p className="text-sm text-gray-600">
                Items: {o.items?.length || 0} • Total: ${o.totalAmount}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <OrderDetailsModal order={selectedOrder} onClose={closeModal} />
    </RequireAuth>
  );
}
