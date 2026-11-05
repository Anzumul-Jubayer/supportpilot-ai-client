
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Headset,
  ShieldCheck,
  Zap,
  Ticket,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

export default function RegisterClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Wake up the Render server.
  useEffect(() => {
    api.get("/api/v1/health").catch(() => {});
  }, []);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
  ];

  const passwordStrength = passwordChecks.filter(
    (check) => check.valid,
  ).length;

  async function handleGoogleSuccess(credential: string) {
    setLoading(true);
    const toastId = toast.loading("Signing up with Google...");

    try {
      const response = await api.post("/api/v1/auth/google", {
        idToken: credential,
      });

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
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      // Step 1: Register the user.
      await api.post("/api/v1/auth/register", {
        name,
        email,
        password,
      });

      // Step 2: Automatically log in.
      const loginRes = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { token, user } = loginRes.data.data;

      saveToken(token);
      saveUser(user);

      toast.success(`Welcome to SupportPilot, ${user.name}!`, {
        id: toastId,
      });

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
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left branding section */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Headset size={25} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            SupportPilot <span className="text-blue-300">AI</span>
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
            <Zap size={15} className="text-yellow-300" />
            Start your support journey
          </div>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Great support
            <br />
            starts with
            <br />
            <span className="text-blue-300">the right tools.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
            Create your SupportPilot account and bring your
            customer support workflow into one organized,
            intelligent platform.
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                icon: Ticket,
                title: "Manage Support Tickets",
                description: "Create, organize, and track customer requests.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Your Account",
                description: "Protected access with secure authentication.",
              },
              {
                icon: Zap,
                title: "Work More Efficiently",
                description: "Build a better support experience for everyone.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={20} className="text-blue-200" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-xs text-blue-100/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-200/60">
          © {new Date().getFullYear()} SupportPilot AI. All rights reserved.
        </p>
      </section>

      {/* Right registration section */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Headset size={23} />
            </div>

            <span className="text-xl font-bold text-gray-900">
              SupportPilot <span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            {/* Heading */}
            <div className="mb-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlus size={25} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Join SupportPilot AI and get started today.
              </p>
            </div>

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={loading}
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    minLength={8}
                    maxLength={72}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-2 flex gap-1.5">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition ${
                            passwordStrength >= level
                              ? passwordStrength === 3
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      {passwordChecks.map((check) => (
                        <p
                          key={check.label}
                          className={`flex items-center gap-2 text-xs ${
                            check.valid ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          <CheckCircle2 size={13} />
                          {check.label}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create your account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">
                OR SIGN UP WITH
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google registration */}
            <div className="flex justify-center">
              {loading ? (
                <p className="text-sm text-gray-400">
                  Please wait...
                </p>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleSuccess(
                        credentialResponse.credential,
                      );
                    } else {
                      toast.error("Google did not return an ID token.");
                    }
                  }}
                  onError={() =>
                    toast.error("Google sign-up was unsuccessful.")
                  }
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="320"
                />
              )}
            </div>
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400 lg:hidden">
            © {new Date().getFullYear()} SupportPilot AI
          </p>
        </div>
      </section>
    </main>
  );
}
