"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
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
        <h1 className="text-2xl font-bold text-[#1F3A2B]">Welcome Back</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sign in to access your Vanvasi account & admin portal
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A2B]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-[#1F3A2B] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1F3A2B]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1F3A2B] hover:bg-[#162a1f] text-white font-medium py-2.5 rounded-md text-sm transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-[#1F3A2B] font-semibold hover:underline"
        >
          Create account
        </Link>
      </div>


    </div>
  );
}

export default function SignInPage() {
  return (
    <section className="min-h-screen bg-[#FBF9F5] text-[#1C241E] flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading sign in...</div>}>
        <SignInForm />
      </Suspense>
    </section>
  );
}
