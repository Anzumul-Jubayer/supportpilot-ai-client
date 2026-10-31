
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import AuthLayout from "@/components/layout/auth-layout";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSuccess(credential: string) {
    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/v1/auth/google", {
        idToken: credential,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Google sign-in failed."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Email/password API integration will be handled separately.
    console.log({ email, password });
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Sign in
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
                setError("Google did not return an ID token.");
              }
            }}
            onError={() => {
              setError("Google sign-in was unsuccessful.");
            }}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="320"
          />
        )}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
