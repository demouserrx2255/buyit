"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { user, token } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!token || !user || user.role !== 'admin') {
      router.replace('/');
    }
  }, [user, token, router]);

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name || user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Products Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-gray-600 mb-4">Manage your product catalog, add new products, and update existing ones.</p>
            <Link 
              href="/admin/products" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Manage Products
            </Link>
          </div>

          {/* Categories Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-gray-600 mb-4">Organize your products with categories and manage product classifications.</p>
            <Link 
              href="/admin/categories" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Manage Categories
            </Link>
          </div>

          {/* Orders Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-gray-600 mb-4">View and manage customer orders, update order status, and track fulfillment.</p>
            <Link 
              href="/admin/orders" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Manage Orders
            </Link>
          </div>

          {/* Users Management */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Users</h2>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-gray-600 mb-4">Manage user accounts, view user information, and handle user-related issues.</p>
            <Link 
              href="/admin/users" 
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
            >
              Manage Users
            </Link>
          </div>

          {/* Analytics Dashboard */}
          {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-600 mb-4">View sales reports, customer analytics, and business insights.</p>
            <Link 
              href="/admin/analytics" 
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              View Analytics
            </Link>
          </div> */}

          {/* Settings */}
          {/* <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <span className="text-2xl">⚙️</span>
            </div>
            <p className="text-gray-600 mb-4">Configure store settings, payment methods, and general preferences.</p>
            <Link 
              href="/admin/settings" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Configure Settings
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
