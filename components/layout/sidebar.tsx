
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  LogOut,
  Headset,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { clearAuth } from "@/lib/auth";
import toast from "react-hot-toast";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

type UserData = {
  name: string;
  email: string;
  role: UserRole;
};

type NavigationItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  CUSTOMER: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],

  AGENT: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assigned Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],

  ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "All Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Agents", href: "/dashboard/agents", icon: UserRound },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);

      if (
        parsedUser.role === "CUSTOMER" ||
        parsedUser.role === "AGENT" ||
        parsedUser.role === "ADMIN"
      ) {
        setUser(parsedUser);
      }
    } catch {
      clearAuth();
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    clearAuth();
    toast.success("Signed out successfully.");
    router.replace("/login");
  }

  const navigation = user ? navigationByRole[user.role] : [];
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col bg-slate-950 text-white transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-blue-600 p-2.5">
              <Headset size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SupportPilot
              </h1>
              <p className="text-xs text-slate-400">AI Support Platform</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile and logout */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "Loading..."}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.role || "User"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
