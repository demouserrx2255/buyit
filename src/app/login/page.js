"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { login } from "../../store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import Link from "next/link";

function LoginPageInner() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);

  // This will redirect authenticated users to home
  const { user, isLoading } = useAuthRedirect();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("secret123");

  // Redirect after successful login
  useEffect(() => {
    if (status === "succeeded" && user) {
      router.replace("/");
    }
    console.log(error,"Auth status:", status, "User:", user);
  }, [status, user, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
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
    <div
      className="min-h-screen flex items-center justify-center p-8"
      suppressHydrationWarning
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-6"
        suppressHydrationWarning
        autoComplete="off"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Logging in..." : "Login"}
        </button>
        <div className="mt-3 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Register
          </Link>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {status === "succeeded" && (
          <p className="text-green-600 text-sm">
            Login successful! Redirecting...
          </p>
        )}
      </form>
    </div>
  );
}

export default dynamic(() => Promise.resolve(LoginPageInner), { ssr: false });
