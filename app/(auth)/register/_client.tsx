"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/auth-layout";
import api from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

export default function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Wake up the Render free tier server as soon as the page loads
  useEffect(() => {
    api.get("/api/v1/health").catch(() => {});
  }, []);

  async function handleGoogleSuccess(credential: string) {
    const toastId = toast.loading("Signing up with Google...");
    try {
      const response = await api.post("/api/v1/auth/google", { idToken: credential });
      const { token, user } = response.data.data;
      saveToken(token);
      saveUser(user);
      toast.success(`Welcome, ${user.name}!`, { id: toastId });
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Google sign-up failed."
        : "Something went wrong. Please try again.";
      toast.error(msg, { id: toastId });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      // Step 1: Register
      await api.post("/api/v1/auth/register", { name, email, password });

      // Step 2: Auto-login
      const loginRes = await api.post("/api/v1/auth/login", { email, password });
      const { token, user } = loginRes.data.data;
      saveToken(token);
      saveUser(user);
      toast.success(`Welcome to SupportPilot, ${user.name}!`, { id: toastId });
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.response?.data?.error ||
          (err.code === "ECONNABORTED"
            ? "Server is waking up, please try again."
            : "Registration failed. Please try again.")
        : "Something went wrong. Please try again.";
      toast.error(msg, { id: toastId });
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Get started with SupportPilot AI"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            minLength={2}
            maxLength={100}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            maxLength={72}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-500">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="flex justify-center">
        {loading ? (
          <p className="text-sm text-slate-500">Creating account...</p>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                handleGoogleSuccess(credentialResponse.credential);
              } else {
                toast.error("Google did not return an ID token.");
              }
            }}
            onError={() => toast.error("Google sign-up was unsuccessful.")}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="320"
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
