"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../store/slices/authSlice";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const router = useRouter();

  // This will redirect authenticated users to home
  const { user, isLoading } = useAuthRedirect();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect after successful registration
  useEffect(() => {
    if (status === "succeeded" && user) {
      router.replace("/");
    }
  }, [status, user, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render the form if user is authenticated (they'll be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Register</h1>
        <input
          type="text"
          placeholder="Name"
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Creating..." : "Create account"}
        </button>
        <div className="mt-3 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Login
          </Link>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {status === "succeeded" && (
          <p className="text-green-600 text-sm">
            Account created successfully! Redirecting...
          </p>
        )}
      </form>
    </div>
  );
}
