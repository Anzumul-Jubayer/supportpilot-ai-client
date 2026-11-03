"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import api from "@/lib/api";

type TicketStatus   = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
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
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
};

const statuses = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const statusConfig: Record<TicketStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  OPEN:        { label: "Open",        badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200/80",     icon: <AlertCircle size={11} /> },
  IN_PROGRESS: { label: "In Progress", badge: "bg-amber-100 text-amber-700 ring-1 ring-amber-200/80",  icon: <Clock size={11} /> },
  RESOLVED:    { label: "Resolved",    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80", icon: <CheckCircle size={11} /> },
  CLOSED:      { label: "Closed",      badge: "bg-gray-100 text-gray-500 ring-1 ring-gray-200/80",     icon: <XCircle size={11} /> },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string; dot: string; bg: string }> = {
  LOW:    { label: "Low",    color: "text-gray-500",  dot: "bg-gray-400",    bg: "bg-gray-50" },
  MEDIUM: { label: "Medium", color: "text-blue-600",  dot: "bg-blue-500",    bg: "bg-blue-50" },
  HIGH:   { label: "High",   color: "text-orange-600", dot: "bg-orange-500", bg: "bg-orange-50" },
  URGENT: { label: "Urgent", color: "text-red-600",   dot: "bg-red-500",     bg: "bg-red-50" },
};

const statCards = [
  { status: "OPEN"        as TicketStatus, bg: "bg-blue-600",    icon: <AlertCircle size={20} className="text-white" /> },
  { status: "IN_PROGRESS" as TicketStatus, bg: "bg-amber-500",   icon: <Clock size={20} className="text-white" /> },
  { status: "RESOLVED"    as TicketStatus, bg: "bg-emerald-500", icon: <CheckCircle size={20} className="text-white" /> },
  { status: "CLOSED"      as TicketStatus, bg: "bg-gray-400",    icon: <XCircle size={20} className="text-white" /> },
];

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400";

export default function TicketsClient() {
  const [tickets, setTickets]     = useState<TicketItem[]>([]);
  const [status, setStatus]       = useState<(typeof statuses)[number]>("ALL");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle]         = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating]   = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) { setFetchError("Authentication required."); return; }
      const res = await api.get<TicketResponse>("/api/v1/tickets", {
        params: { page, limit: 10, ...(status !== "ALL" && { status }) },
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.data.tickets);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotal(res.data.data.pagination.total);
    } catch {
      setFetchError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const toastId = toast.loading("Creating ticket…");
    try {
      const token = localStorage.getItem("token");
      if (!token) { toast.error("Please log in again.", { id: toastId }); return; }
      await api.post("/api/v1/tickets", { title, description }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Ticket created successfully!", { id: toastId });
      setTitle(""); setDescription(""); setShowModal(false); setPage(1);
      await fetchTickets();
    } catch {
      toast.error("Failed to create ticket. Please try again.", { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const filtered = search.trim()
    ? tickets.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : tickets;

  const statusCounts = (["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }),
    {} as Record<TicketStatus, number>
  );

  return (
    <div className="space-y-6 p-1">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all support requests in one place.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={fetchTickets}
            title="Refresh"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={16} />
            New Ticket
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map(({ status: s, bg, icon }) => {
          const cfg   = statusConfig[s];
          const count = statusCounts[s] ?? 0;
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${active ? "ring-2 ring-blue-500 ring-offset-1" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{cfg.label}</p>
                <div className={`rounded-xl p-2 ${bg}`}>{icon}</div>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{count}</p>
              {active && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 rounded-b-2xl" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="shrink-0 text-gray-400" />
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                status === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-400">
            <span className="font-semibold text-gray-700">{total}</span> total
          </span>
        </div>
      </div>

      {/* ── Table / States ─────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24 shadow-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-500">Loading tickets…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-20">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <p className="mt-4 font-semibold text-red-700">{fetchError}</p>
          <button
            onClick={fetchTickets}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24 shadow-sm">
          <div className="rounded-2xl bg-blue-50 p-5">
            <InboxIcon size={32} className="text-blue-400" />
          </div>
          <p className="mt-5 text-base font-semibold text-gray-800">No tickets found</p>
          <p className="mt-1.5 text-sm text-gray-500">
            {search ? `No results for "${search}".` : status === "ALL" ? "Create your first ticket to get started." : `No ${status.replace("_", " ")} tickets right now.`}
          </p>
          {status === "ALL" && !search && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} /> Create a ticket
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ticket</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ticket) => {
                const sc = statusConfig[ticket.status];
                const pc = priorityConfig[ticket.priority];
                return (
                  <tr key={ticket.id} className="group transition-colors hover:bg-blue-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-gray-100 p-1.5 group-hover:bg-blue-100">
                          <TicketIcon size={14} className="text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700 leading-snug">{ticket.title}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-gray-400">#{ticket.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${sc.badge}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${pc.color} ${pc.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
                        {pc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.category ? (
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {ticket.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────── */}
      {!loading && !fetchError && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create Ticket Modal ────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2">
                  <Plus size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Create New Ticket</h2>
                  <p className="text-xs text-gray-500">Describe your issue in detail.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  minLength={5}
                  maxLength={150}
                  required
                  disabled={creating}
                  placeholder="e.g. Login button not working on mobile"
                  className={fieldClass}
                />
                <p className={`mt-1.5 text-right text-xs ${title.length > 130 ? "text-orange-500" : "text-gray-400"}`}>
                  {title.length} / 150
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={10}
                  maxLength={5000}
                  required
                  rows={5}
                  disabled={creating}
                  placeholder="Steps to reproduce, expected vs actual behaviour, screenshots, etc."
                  className={`${fieldClass} resize-none`}
                />
                <p className={`mt-1.5 text-right text-xs ${description.length > 4500 ? "text-orange-500" : "text-gray-400"}`}>
                  {description.length} / 5000
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || title.length < 5 || description.length < 10}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
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
