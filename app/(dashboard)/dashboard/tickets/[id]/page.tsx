
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string | null;
  aiSummary: string | null;
  aiReply: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assigneeId: string | null;
};

type TicketResponse = {
  success: boolean;
  data: Ticket;
};

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required. Please log in again.");
          return;
        }

        const response = await api.get<TicketResponse>(
          `/api/v1/tickets/${ticketId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTicket(response.data.data);
      } catch (err) {
        console.error("Failed to fetch ticket:", err);
        setError("Unable to load this ticket. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const statusColors: Record<Ticket["status"], string> = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-900",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-200 text-gray-800",
  };

  const priorityColors: Record<Ticket["priority"], string> = {
    LOW: "text-gray-700",
    MEDIUM: "text-blue-700",
    HIGH: "text-orange-700",
    URGENT: "text-red-700",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-gray-600">
          Loading ticket details...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Unable to display ticket
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {error || "Ticket not found."}
        </p>
        <button
          onClick={() => router.push("/dashboard/tickets")}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => router.push("/dashboard/tickets")}
        className="text-sm font-semibold text-blue-700 hover:text-blue-900"
      >
        ← Back to Tickets
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Ticket Details
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {ticket.title}
            </h1>
            <p className="mt-2 break-all text-xs text-gray-500">
              ID: {ticket.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[ticket.status]}`}
            >
              {ticket.status.replace("_", " ")}
            </span>
            <span
              className={`rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold ${priorityColors[ticket.priority]}`}
            >
              {ticket.priority} PRIORITY
            </span>
          </div>
        </div>

        <div className="my-6 border-t border-gray-200" />

        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {ticket.description}
          </p>
        </section>

        <div className="my-6 border-t border-gray-200" />

        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Ticket Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Category</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {ticket.category || "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Assigned Agent</p>
              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {ticket.assigneeId || "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Created At</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Last Updated</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {new Date(ticket.updatedAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">Creator ID</p>
              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {ticket.creatorId}
              </p>
            </div>
          </div>
        </section>

        {(ticket.aiSummary || ticket.aiReply) && (
          <>
            <div className="my-6 border-t border-gray-200" />

            <section>
              <h2 className="text-base font-semibold text-gray-900">
                AI Assistance
              </h2>

              {ticket.aiSummary && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-blue-900">
                    AI Summary
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-blue-800">
                    {ticket.aiSummary}
                  </p>
                </div>
              )}

              {ticket.aiReply && (
                <div className="mt-4 rounded-lg bg-green-50 p-4">
                  <h3 className="text-sm font-semibold text-green-900">
                    AI Suggested Reply
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-green-800">
                    {ticket.aiReply}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
