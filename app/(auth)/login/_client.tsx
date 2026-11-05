
"use client";

import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import {
  Eye,
  EyeOff,
  Headset,
  ShieldCheck,
  Zap,
  Ticket,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";

const demoAccounts = [
  {
    role: "Support Agent",
    email: "agent@example1.com",
    password: "AgentPass123",
    color: "bg-blue-50 text-blue-700",
  },
  {
    role: "Customer",
    email: "user@example3.com",
    password: "stringst",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    role: "Administrator",
    email: "support-ai-admin@gmail.com",
    password: "admin1235678",
    color: "bg-purple-50 text-purple-700",
  },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (justRegistered) {
      toast.success("Account created! Please sign in.");
    }
  }, [justRegistered]);

  // Wake up the Render server.
  useEffect(() => {
    api.get("/api/v1/health").catch(() => {});
  }, []);

  function useDemoAccount(account: (typeof demoAccounts)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    toast.success(`${account.role} credentials filled!`);
  }

  async function handleGoogleSuccess(credential: string) {
    setLoading(true);
    const toastId = toast.loading("Signing in with Google...");

    try {
      const response = await api.post("/api/v1/auth/google", {
        idToken: credential,
      });

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
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

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
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left branding section */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Headset size={25} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            SupportPilot <span className="text-blue-300">AI</span>
          </span>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-100">
            <Zap size={15} className="text-yellow-300" />
            Intelligent Customer Support
          </div>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Support smarter.
            <br />
            Resolve faster.
            <br />
            <span className="text-blue-300">Deliver better.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-blue-100/80">
            Manage customer conversations, track support tickets, and
            deliver exceptional support from one intelligent platform.
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                icon: Ticket,
                title: "Smart Ticket Management",
                description: "Organize and track every customer request.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Authentication",
                description: "Protected access for every account role.",
              },
              {
                icon: Zap,
                title: "Faster Support Workflow",
                description: "Keep your support team productive.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon size={20} className="text-blue-200" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
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

      {/* Right login section */}
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
            <div className="mb-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Headset size={25} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to continue to your SupportPilot dashboard.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google login */}
            <div className="flex justify-center">
              {loading ? (
                <p className="text-sm text-gray-400">Please wait...</p>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleSuccess(credentialResponse.credential);
                    } else {
                      toast.error("Google did not return an ID token.");
                    }
                  }}
                  onError={() =>
                    toast.error("Google sign-in was unsuccessful.")
                  }
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="320"
                />
              )}
            </div>

            {/* Demo accounts */}
            <div className="mt-7 border-t border-gray-100 pt-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Explore with demo accounts
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                    DEMO ACCESS
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Select a role to autofill its login credentials.
                </p>
              </div>

              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={loading}
                    onClick={() => useDemoAccount(account)}
                    className="group flex w-full items-center justify-between rounded-xl border border-gray-200 px-3.5 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${account.color}`}
                      >
                        <CheckCircle2 size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {account.role}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {account.email}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </button>
                ))}
              </div>

              <p className="mt-3 text-[11px] leading-5 text-gray-400">
                Demo accounts are provided for testing and exploration.
                Please do not use demo credentials for personal data.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Create an account
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

export default function LoginClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
