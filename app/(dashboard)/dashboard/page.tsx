
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface RecentTicket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  recentTickets: RecentTicket[];
}

const statsConfig = [
  {
    title: "Total Tickets",
    key: "totalTickets",
    icon: Ticket,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Open Tickets",
    key: "openTickets",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "In Progress",
    key: "inProgressTickets",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Resolved",
    key: "resolvedTickets",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
] as const;

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-orange-100 text-orange-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await api.get("/api/v1/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data.data);
    } catch (err: unknown) {
      console.error("Dashboard error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "status" in err.response &&
        err.response.status === 401
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setError("Unable to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to SupportPilot AI
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your support activity.
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.title}</p>
                <div className={`rounded-lg p-2 ${item.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {stats[item.key]}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Recent tickets */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Tickets
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest support ticket activity.
          </p>
        </div>

        {stats.recentTickets.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No tickets available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {stats.recentTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() =>
                  router.push(`/dashboard/tickets/${ticket.id}`)
                }
                className="flex w-full flex-col gap-3 rounded-lg border border-gray-100 p-4 text-left transition hover:border-blue-200 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {ticket.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
