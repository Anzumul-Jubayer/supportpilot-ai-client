"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/auth-layout";
import api from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Show success toast if redirected from registration
  useEffect(() => {
    if (justRegistered) {
      toast.success("Account created! Please sign in.");
    }
  }, [justRegistered]);

  // Wake up the Render free tier server as soon as the page loads
  useEffect(() => {
    api.get("/api/v1/health").catch(() => {});
  }, []);

  async function handleGoogleSuccess(credential: string) {
    const toastId = toast.loading("Signing in with Google...");
    try {
      const response = await api.post("/api/v1/auth/google", { idToken: credential });
      const { token, user } = response.data.data;
      saveToken(token);
      saveUser(user);
      toast.success(`Welcome back, ${user.name}!`, { id: toastId });
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Google sign-in failed."
        : "Something went wrong. Please try again.";
      toast.error(msg, { id: toastId });
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Signing in...");
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      const { token, user } = response.data.data;
      saveToken(token);
      saveUser(user);
      toast.success(`Welcome back, ${user.name}!`, { id: toastId });
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.response?.data?.error ||
          (err.code === "ECONNABORTED"
            ? "Server is waking up, please try again."
            : "Invalid email or password.")
        : "Something went wrong. Please try again.";
      toast.error(msg, { id: toastId });
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your SupportPilot AI account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
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
              Signing in...
            </span>
          ) : (
            "Sign in"
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
          <p className="text-sm text-slate-500">Signing in...</p>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                handleGoogleSuccess(credentialResponse.credential);
              } else {
                toast.error("Google did not return an ID token.");
              }
            }}
            onError={() => toast.error("Google sign-in was unsuccessful.")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="320"
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginClient() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
