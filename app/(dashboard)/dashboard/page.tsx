
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Headset,
  CalendarDays,
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
    color: "bg-blue-50 text-blue-600",
    description: "All support tickets",
  },
  {
    title: "Open Tickets",
    key: "openTickets",
    icon: AlertCircle,
    color: "bg-amber-50 text-amber-600",
    description: "Waiting for attention",
  },
  {
    title: "In Progress",
    key: "inProgressTickets",
    icon: Clock,
    color: "bg-violet-50 text-violet-600",
    description: "Currently being handled",
  },
  {
    title: "Resolved",
    key: "resolvedTickets",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
    description: "Successfully resolved",
  },
  {
    title: "Closed",
    key: "closedTickets",
    icon: XCircle,
    color: "bg-slate-100 text-slate-600",
    description: "Completed tickets",
  },
] as const;

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-amber-50 text-amber-700 ring-amber-600/20",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-600/20",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = useCallback(async () => {
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

      const status =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      setError("Unable to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-600">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Something went wrong
        </h2>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={fetchDashboardStats}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 pb-6">
      {/* Welcome section */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <Headset size={17} />
            <span>Support workspace</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your support tickets.
          </p>
        </div>

        <Link
          href="/dashboard/tickets"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
        >
          View all tickets
          <ArrowUpRight size={17} />
        </Link>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Ticket Statistics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick overview of your support activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {statsConfig.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <div className={`rounded-xl p-2.5 ${item.color}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <h3 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                  {stats[item.key]}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent tickets */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Tickets
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest support ticket activity.
            </p>
          </div>

          <Link
            href="/dashboard/tickets"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {stats.recentTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              <Ticket size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No tickets yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Your recent support tickets will appear here once available.
            </p>

            <Link
              href="/dashboard/tickets"
              className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Explore tickets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {stats.recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="max-w-xs px-6 py-5">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {ticket.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        #{ticket.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={15} />
                        {formatDate(ticket.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[ticket.status]}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/dashboard/tickets/${ticket.id}`}
                        aria-label={`View ticket ${ticket.title}`}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        View
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {stats.recentTickets.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-400">
              Showing your latest {stats.recentTickets.length} tickets.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
