
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  Save,
  Mail,
  Settings,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
};

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<UserData | null>(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData;
        setUser(parsedUser);
        setName(parsedUser.name);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleProfileSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    toast("Profile update API is not connected yet.", {
      icon: "ℹ️",
    });
  };

  const handlePasswordSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    toast("Password update API is not connected yet.", {
      icon: "ℹ️",
    });
  };

  const handleNotificationSave = () => {
    toast("Notification settings API is not connected yet.", {
      icon: "ℹ️",
    });
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const roleLabel = user?.role || "USER";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Settings size={20} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Settings
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage your account, security, and preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-green-700">
            Account Active
          </span>
        </div>
      </div>

      {/* Account Overview */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 sm:h-28" />

        <div className="px-5 pb-5 sm:px-7">
          <div className="-mt-9 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-sm sm:h-24 sm:w-24">
                {name.trim().charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 pb-1">
                <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                  {user?.name || "Your Name"}
                </h2>
                <p className="truncate text-sm text-gray-500">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700">
              {roleLabel}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-green-600" />
              Account information
            </div>

            <div className="flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              Security preferences
            </div>
          </div>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
          <div className="hidden px-3 pb-3 pt-2 lg:block">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Account Settings
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-blue-600" : "text-gray-400"}
                  />
                  {tab.label}

                  {active && (
                    <ArrowRight
                      size={15}
                      className="ml-auto hidden lg:block"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 hidden rounded-xl bg-gray-50 p-4 lg:block">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-blue-600" />
              <p className="text-xs font-semibold text-gray-800">
                Your account matters
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Keep your profile information up to date and use a strong,
              unique password.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 lg:col-span-3">
          {/* Profile */}
          {activeTab === "profile" && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    <User size={19} className="text-blue-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Profile Information
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Manage your personal account information.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleProfileSave}
                className="space-y-6 p-5 sm:p-7"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Your name will be displayed across your dashboard.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={user?.email || ""}
                      disabled
                      className={`${inputClass} cursor-not-allowed bg-gray-50 pl-11 text-gray-500`}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Your email address cannot be changed here.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Account information
                      </p>
                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Your account role is managed by the system
                        administrator.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:w-auto"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                    <Lock size={19} className="text-purple-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Password & Security
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Protect your account with a strong password.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handlePasswordSave}
                className="space-y-5 p-5 sm:p-7"
              >
                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={21}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Security recommendation
                      </p>
                      <p className="mt-1 text-xs leading-5 text-green-700">
                        Use a unique password with at least 8 characters.
                        Avoid reusing passwords from other websites.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Minimum 8 characters.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:w-auto"
                  >
                    <Lock size={16} />
                    Update Password
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Bell size={19} className="text-amber-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      Notification Preferences
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Choose how you want to receive updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 px-5 sm:px-7">
                {[
                  {
                    title: "Email Notifications",
                    description:
                      "Receive important account notifications through email.",
                    value: emailNotifications,
                    setter: setEmailNotifications,
                    icon: Mail,
                  },
                  {
                    title: "Ticket Updates",
                    description:
                      "Get notified when your tickets are created or updated.",
                    value: ticketUpdates,
                    setter: setTicketUpdates,
                    icon: CheckCircle2,
                  },
                  {
                    title: "System Notifications",
                    description:
                      "Receive important announcements and system updates.",
                    value: systemNotifications,
                    setter: setSystemNotifications,
                    icon: Bell,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                          <Icon size={17} className="text-gray-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-label={item.title}
                        aria-checked={item.value}
                        onClick={() => item.setter(!item.value)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                          item.value ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                            item.value ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end border-t border-gray-100 p-5 sm:px-7 sm:py-5">
                <button
                  onClick={handleNotificationSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:w-auto"
                >
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
