
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  RefreshCw,
  TicketIcon,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  Search,
  InboxIcon,
  CalendarDays,
} from "lucide-react";
import api from "@/lib/api";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type TicketItem = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  createdAt: string;
  creatorId: string;
  assigneeId: string | null;
};

type TicketResponse = {
  success: boolean;
  data: {
    tickets: TicketItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

const statuses = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const statusConfig: Record<
  TicketStatus,
  { label: string; badge: string; icon: ReactNode }
> = {
  OPEN: {
    label: "Open",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: <AlertCircle size={12} />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: <Clock size={12} />,
  },
  RESOLVED: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: <CheckCircle size={12} />,
  },
  CLOSED: {
    label: "Closed",
    badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    icon: <XCircle size={12} />,
  },
};

const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; dot: string; bg: string }
> = {
  LOW: {
    label: "Low",
    color: "text-gray-600",
    dot: "bg-gray-400",
    bg: "bg-gray-50",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-blue-700",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
  },
  HIGH: {
    label: "High",
    color: "text-orange-700",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
  },
  URGENT: {
    label: "Urgent",
    color: "text-red-700",
    dot: "bg-red-500",
    bg: "bg-red-50",
  },
};

const statCards = [
  {
    status: "OPEN" as TicketStatus,
    bg: "bg-blue-600",
    icon: <AlertCircle size={19} className="text-white" />,
  },
  {
    status: "IN_PROGRESS" as TicketStatus,
    bg: "bg-amber-500",
    icon: <Clock size={19} className="text-white" />,
  },
  {
    status: "RESOLVED" as TicketStatus,
    bg: "bg-emerald-500",
    icon: <CheckCircle size={19} className="text-white" />,
  },
  {
    status: "CLOSED" as TicketStatus,
    bg: "bg-gray-500",
    icon: <XCircle size={19} className="text-white" />,
  },
];

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400";

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown date";
  }

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsClient() {
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [status, setStatus] =
    useState<(typeof statuses)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Fetch tickets from the backend
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setFetchError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setFetchError("Authentication required. Please log in again.");
        return;
      }

      const res = await api.get<TicketResponse>("/api/v1/tickets", {
        params: {
          page,
          limit: 10,
          ...(status !== "ALL" && { status }),
          ...(debouncedSearch && { search: debouncedSearch }),
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(res.data.data.tickets);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
    } catch {
      setFetchError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Create a new ticket
  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setCreating(true);
    const toastId = toast.loading("Creating ticket...");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in again.", { id: toastId });
        return;
      }

      await api.post(
        "/api/v1/tickets",
        { title: title.trim(), description: description.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Ticket created successfully!", { id: toastId });

      setTitle("");
      setDescription("");
      setShowModal(false);

      // If already on page 1, refresh manually.
      // Otherwise, changing the page triggers the fetching effect.
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchTickets();
      }
    } catch {
      toast.error("Failed to create ticket. Please try again.", {
        id: toastId,
      });
    } finally {
      setCreating(false);
    }
  };

  // Counts represent tickets visible on the current page,
  // not the total number of tickets in the database.
  const statusCounts = (
    ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]
  ).reduce(
    (acc, currentStatus) => ({
      ...acc,
      [currentStatus]: tickets.filter(
        (ticket) => ticket.status === currentStatus,
      ).length,
    }),
    {} as Record<TicketStatus, number>,
  );

  const startItem = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, total);

  const openTicket = (id: string) => {
    router.push(`/dashboard/tickets/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2">
              <TicketIcon size={21} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Support Tickets
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Manage and track support requests from one place.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={fetchTickets}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] sm:flex-none"
          >
            <Plus size={17} />
            New Ticket
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map(({ status: cardStatus, bg, icon }) => {
          const config = statusConfig[cardStatus];
          const active = status === cardStatus;

          return (
            <button
              key={cardStatus}
              type="button"
              onClick={() => {
                setStatus(cardStatus);
                setPage(1);
              }}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                active
                  ? "border-blue-300 ring-2 ring-blue-500/20"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-gray-500 sm:text-sm">
                  {config.label}
                </p>

                <div className={`rounded-xl p-2 ${bg}`}>
                  {icon}
                </div>
              </div>

              <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                {status === "ALL" ? statusCounts[cardStatus] : "—"}
              </p>

              <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">
                {status === "ALL"
                  ? "Visible on this page"
                  : "Select All to view counts"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ticket title or description..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal size={16} />
            <span className="font-medium">Filter by status</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((currentStatus) => (
            <button
              key={currentStatus}
              type="button"
              onClick={() => {
                setStatus(currentStatus);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                status === currentStatus
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {currentStatus === "ALL"
                ? "All tickets"
                : currentStatus.replace("_", " ")}
            </button>
          ))}

          <span className="ml-auto text-xs text-gray-500 sm:text-sm">
            <span className="font-semibold text-gray-900">{total}</span>{" "}
            results
          </span>
        </div>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading tickets...
          </p>
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-5 text-center shadow-sm">
          <div className="rounded-full bg-red-50 p-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>

          <p className="mt-4 font-semibold text-gray-900">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-gray-500">{fetchError}</p>

          <button
            type="button"
            onClick={fetchTickets}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-center shadow-sm">
          <div className="rounded-2xl bg-blue-50 p-5">
            <InboxIcon size={34} className="text-blue-500" />
          </div>

          <h2 className="mt-5 text-base font-semibold text-gray-900">
            No tickets found
          </h2>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
            {debouncedSearch
              ? `No results found for "${debouncedSearch}". Try another search.`
              : status === "ALL"
                ? "There are no tickets yet. Create your first support ticket to get started."
                : `There are no ${status.replace("_", " ").toLowerCase()} tickets right now.`}
          </p>

          {status === "ALL" && !debouncedSearch && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Create your first ticket
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop and tablet table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Ticket
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Priority
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Category
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {tickets.map((ticket) => {
                    const statusInfo = statusConfig[ticket.status];
                    const priorityInfo = priorityConfig[ticket.priority];

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => openTicket(ticket.id)}
                        className="cursor-pointer transition-colors hover:bg-blue-50/50"
                      >
                        <td className="max-w-[320px] px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                              <TicketIcon
                                size={15}
                                className="text-gray-500"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900 hover:text-blue-700">
                                {ticket.title}
                              </p>

                              <p className="mt-1 font-mono text-[11px] text-gray-400">
                                #{ticket.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.badge}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${priorityInfo.color} ${priorityInfo.bg}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`}
                            />
                            {priorityInfo.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {ticket.category ? (
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
                              {ticket.category}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm text-gray-700">
                            {formatDate(ticket.createdAt)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {formatTime(ticket.createdAt)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile ticket cards */}
          <div className="space-y-3 md:hidden">
            {tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status];
              const priorityInfo = priorityConfig[ticket.priority];

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => openTicket(ticket.id)}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2">
                        <TicketIcon
                          size={17}
                          className="text-blue-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {ticket.title}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-gray-400">
                          #{ticket.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className="mt-1 shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusInfo.badge}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${priorityInfo.color} ${priorityInfo.bg}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dot}`}
                      />
                      {priorityInfo.label}
                    </span>

                    {ticket.category && (
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                        {ticket.category}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <CalendarDays size={13} />
                    {formatDate(ticket.createdAt)}
                    <span>·</span>
                    {formatTime(ticket.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !fetchError && total > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-center text-xs text-gray-500 sm:text-left sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-gray-900">{startItem}</span>
            {" – "}
            <span className="font-semibold text-gray-900">{endItem}</span>
            {" of "}
            <span className="font-semibold text-gray-900">{total}</span>
            {" tickets"}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="px-2 text-xs font-medium text-gray-500 sm:text-sm">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create ticket modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-3 backdrop-blur-sm sm:p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setShowModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-ticket-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5">
                  <Plus size={19} className="text-blue-600" />
                </div>

                <div>
                  <h2
                    id="create-ticket-title"
                    className="text-base font-bold text-gray-900"
                  >
                    Create New Ticket
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Tell us what you need help with.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={creating}
                aria-label="Close modal"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleCreate}
              className="space-y-5 px-5 py-5 sm:px-6"
            >
              <div>
                <label
                  htmlFor="ticket-title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Ticket title <span className="text-red-500">*</span>
                </label>

                <input
                  id="ticket-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={5}
                  maxLength={150}
                  required
                  disabled={creating}
                  placeholder="e.g. Login button not working"
                  className={fieldClass}
                />

                <p
                  className={`mt-1.5 text-right text-xs ${
                    title.length > 130 ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {title.length}/150 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="ticket-description"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="ticket-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={10}
                  maxLength={5000}
                  required
                  rows={5}
                  disabled={creating}
                  placeholder="Describe the issue, what happened, and how we can reproduce it..."
                  className={`${fieldClass} resize-none`}
                />

                <p
                  className={`mt-1.5 text-right text-xs ${
                    description.length > 4500
                      ? "text-orange-500"
                      : "text-gray-400"
                  }`}
                >
                  {description.length}/5000 characters
                </p>
              </div>

              {/* Modal actions */}
              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    title.trim().length < 5 ||
                    description.trim().length < 10
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
