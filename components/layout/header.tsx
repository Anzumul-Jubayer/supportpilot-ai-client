
"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "AGENT" | "ADMIN";
};

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

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

  function getPageTitle() {
    if (pathname.startsWith("/dashboard/tickets/")) {
      return "Ticket Details";
    }

    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/tickets": "Tickets",
      "/dashboard/agents": "Agents",
      "/dashboard/users": "Users",
      "/dashboard/settings": "Settings",
    };

    return titles[pathname] || "Dashboard";
  }

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {getPageTitle()}
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            Welcome back to SupportPilot AI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
        >
          <Bell size={20} />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            {initial}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-900">
              {user?.name || "Loading..."}
            </p>

            <p className="text-xs text-slate-500">
              {user?.role || ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
