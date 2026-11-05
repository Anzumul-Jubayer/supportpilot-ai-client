
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { clearAuth } from "@/lib/auth";
import toast from "react-hot-toast";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

type NavigationItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);

      if (
        user.role === "CUSTOMER" ||
        user.role === "AGENT" ||
        user.role === "ADMIN"
      ) {
        setRole(user.role);
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

  const navigation = role ? navigationByRole[role] : [];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="rounded-lg bg-blue-600 p-2 text-white">
          <Headset size={22} />
        </div>

        <span className="text-lg font-bold text-gray-900">
          SupportPilot AI
        </span>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={19} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
