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

  useEffect(() => {
    if (error) {
      setPassword("");
      setEmail("");
    }
  }, [error]);

  useEffect(() => {
    if (status === "succeeded" && user) {
      router.replace("/");
    }
  }, [status, user, router]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div data-testid="loading" className="text-lg">
          Loading...
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      suppressHydrationWarning
    >
      <title>Login</title>
      <form
        data-testid="login-form"
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-6"
        suppressHydrationWarning
        autoComplete="off"
      >
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          data-testid="email-input"
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <input
          data-testid="password-input"
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          data-testid="login-button"
          type="submit"
          className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Logging in..." : "Login"}
        </button>
        <div className="mt-3 text-center text-sm">
          Don't have an account?{" "}
          <Link
            data-testid="register-link"
            href="/register"
            className="text-blue-600 underline"
          >
            Register
          </Link>
        </div>
        {error && (
          <p data-testid="error-message" className="text-red-600 text-sm">
            {error}
          </p>
        )}
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
