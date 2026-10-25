"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Token or email is missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed or token expired.");
        }
      } catch {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      }
    };

    verify();
  }, [token, email]);

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
      <Link href="/" className="inline-block mb-4">
        <img
          src="/images/6.png"
          alt="The Vanvasi Project"
          className="h-10 mx-auto rounded-md"
        />
      </Link>

      <h1 className="text-2xl font-bold text-[#1F3A2B] mb-2">Email Verification</h1>

      {status === "loading" && (
        <div className="py-8 space-y-2">
          <div className="w-8 h-8 border-4 border-[#1F3A2B] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500">Verifying your email address...</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-xs text-green-800">
            <p className="font-semibold text-sm mb-1">Email Verified Successfully!</p>
            <p>{message}</p>
          </div>
          <Link
            href="/auth/signin"
            className="inline-block w-full bg-[#1F3A2B] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#162a1f]"
          >
            Sign In to Your Account
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
            <p className="font-semibold text-sm mb-1">Verification Failed</p>
            <p>{message}</p>
          </div>
          <Link
            href="/auth/signup"
            className="inline-block w-full border border-gray-300 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Create New Account
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <section className="min-h-screen bg-[#FBF9F5] text-[#1C241E] flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="p-8 text-sm text-gray-500">Verifying...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </section>
  );
}
