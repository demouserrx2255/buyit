"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types";

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Replace with your API call to update profile
      // Example: await api.put(`/api/users/${user._id}`, formData);

      await new Promise((r) => setTimeout(r, 1000)); // simulate network delay

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditMode(false);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    }

    setLoading(false);
  };

  if (!user)
    return (
      <div className="text-center py-10 text-gray-600">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>

      {!editMode ? (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Name</label>
            <p className="text-gray-900 text-lg">{formData.name}</p>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Email</label>
            <p className="text-gray-900 text-lg">{formData.email}</p>
          </div>

          <button
            onClick={() => setEditMode(true)}
            className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleSave();
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-semibold mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                message.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-grow bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEditMode(false);
                setFormData({
                  name: user?.name || "",
                  email: user?.email || "",
                });
                setMessage(null);
              }}
              className="flex-grow border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
