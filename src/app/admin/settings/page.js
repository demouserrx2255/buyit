"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const { user, token } = useSelector((state) => state.auth);
  const router = useRouter();
  const [settings, setSettings] = useState({
    storeName: 'Ecommerce Store',
    storeDescription: 'Your one-stop shop for everything you need',
    contactEmail: 'admin@example.com',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Commerce St, Business City, BC 12345',
    currency: 'USD',
    taxRate: 8.5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      router.replace('/');
      return;
    }
    // In a real app, you'd fetch settings from an API
    setLoading(false);
  }, [user, token, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, you'd save settings to an API
    alert('Settings saved successfully!');
  };

  if (!user || user.role !== 'admin') return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
            <p className="text-gray-600 mt-2">Configure your store preferences</p>
          </div>
          <Link href="/admin" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to Admin
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">General Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={settings.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
              <textarea
                name="storeDescription"
                value={settings.storeDescription}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows="2"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
