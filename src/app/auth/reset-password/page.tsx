"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-3">
          <img
            src="/images/6.png"
            alt="The Vanvasi Project"
            className="h-10 mx-auto rounded-md"
          />
        </Link>
        <h1 className="text-2xl font-bold text-[#1F3A2B]">Set New Password</h1>
        <p className="text-xs text-gray-500 mt-1">
          Choose a strong password for {email || "your account"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-xs text-green-800">
            <p className="font-semibold text-sm mb-1">Password Reset Complete</p>
            <p>Your password has been updated. You can now sign in with your new password.</p>
          </div>
          <Link
            href="/auth/signin"
            className="inline-block w-full bg-[#1F3A2B] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#162a1f]"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A2B] hover:bg-[#162a1f] text-white font-medium py-2.5 rounded-md text-sm transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="min-h-screen bg-[#FBF9F5] text-[#1C241E] flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
