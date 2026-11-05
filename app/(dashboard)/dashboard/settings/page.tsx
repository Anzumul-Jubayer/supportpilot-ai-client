
"use client";

import { useEffect, useState } from "react";
import {
  User,
  Lock,
  Bell,
  ShieldCheck,
  Save,
  Mail,
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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    toast("Profile update API is not connected yet.", {
      icon: "ℹ️",
    });
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();

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
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Profile */}
          {activeTab === "profile" && (
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-gray-900">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your personal information.
                </p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                    {name.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user?.name || "Your Name"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user?.role || "USER"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
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
                      className={`${inputClass} bg-gray-50 pl-11 text-gray-500`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
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
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-gray-900">
                  Password & Security
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Keep your account secure with a strong password.
                </p>
              </div>

              <form onSubmit={handlePasswordSave} className="space-y-5 p-6">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={20}
                      className="shrink-0 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Account Security
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        Use a unique password with at least 8 characters.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
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
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-semibold text-gray-900">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose which notifications you want to receive.
                </p>
              </div>

              <div className="divide-y divide-gray-100 px-6">
                {[
                  {
                    title: "Email Notifications",
                    description: "Receive notifications through email.",
                    value: emailNotifications,
                    setter: setEmailNotifications,
                  },
                  {
                    title: "Ticket Updates",
                    description: "Get notified when your tickets change.",
                    value: ticketUpdates,
                    setter: setTicketUpdates,
                  },
                  {
                    title: "System Notifications",
                    description: "Receive important system announcements.",
                    value: systemNotifications,
                    setter: setSystemNotifications,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-4 py-5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.value}
                      onClick={() => item.setter(!item.value)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        item.value ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                          item.value ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 p-6">
                <button
                  onClick={handleNotificationSave}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
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
