
"use client";

import { Bell, Search, ChevronDown, User } from "lucide-react";
import { useEffect, useState } from "react";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
};

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as UserData);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Dashboard title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex">
          <Search size={17} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search tickets..."
            className="w-48 text-sm outline-none"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="text-gray-600 transition hover:text-blue-600"
        >
          <Bell size={20} />
        </button>

        {/* Dynamic user information */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {initial}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name || "Loading..."}
            </p>

            <p className="text-xs text-gray-500">
              {user?.email || ""}
            </p>

            <p className="text-xs font-medium text-blue-600">
              {user?.role || ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
