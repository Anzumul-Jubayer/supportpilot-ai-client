"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

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

type Agent = {
  id: string;
  name: string;
  email: string;
};

type AgentsResponse = {
  success: boolean;
  data: Agent[];
};

type MeResponse = {
  success: boolean;
  data: {
    userId: string;
    role: UserRole;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  ticketId?: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
};

type CommentsResponse = {
  success: boolean;
  data: Comment[];
};

type CreateCommentResponse = {
  success: boolean;
  message: string;
  data: Comment;
};

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");
  const [assignError, setAssignError] = useState("");

  // Fetch ticket details
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
          },
        );

        setTicket(response.data.data);
        setSelectedAgent(response.data.data.assigneeId || "");
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

  // Fetch current user role, then load agents only for AGENT or ADMIN
  useEffect(() => {
    const fetchUserAndAgents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await api.get<MeResponse>("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const role = response.data.data.role;
        setCurrentUserRole(role);

        if (role === "AGENT" || role === "ADMIN") {
          setLoadingAgents(true);

          const agentsResponse = await api.get<AgentsResponse>(
            "/api/v1/users/agents",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setAgents(agentsResponse.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user or agents:", err);
        setAssignError("Unable to load agent information.");
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchUserAndAgents();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        setCommentError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setCommentError("Authentication required. Please log in again.");
          return;
        }
        console.log("Ticket ID from URL:", ticketId);
        console.log("Ticket ID from API:", ticket?.id);
        const response = await api.get<CommentsResponse>(
          `/api/v1/tickets/${ticketId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setComments(response.data.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setCommentError("Unable to load comments. Please try again.");
      } finally {
        setLoadingComments(false);
      }
    };

    if (ticketId) {
      fetchComments();
    }
  }, [ticketId]);

  // Submit comment
  const handleSubmitComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = commentText.trim();

    if (!content) {
      setCommentError("Please enter a comment.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");
      setCommentSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setCommentError("Please log in again.");
        return;
      }

      const response = await api.post<CreateCommentResponse>(
        `/api/v1/tickets/${ticketId}/comments`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setComments((current) => [...current, response.data.data]);
      setCommentText("");
      setCommentSuccess("Comment added successfully.");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setCommentError("Unable to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Update ticket status
  const handleStatusUpdate = async (newStatus: Ticket["status"]) => {
    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setStatusError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setStatusError("Please log in again.");
        return;
      }

      const response = await api.patch(
        `/api/v1/tickets/${ticketId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTicket((current) =>
        current ? { ...current, ...response.data.data } : current,
      );

      setStatusMessage("Ticket status updated successfully.");
    } catch (err) {
      console.error("Status update failed:", err);
      setStatusError("Unable to update ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Assign agent to ticket
  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      setAssignError("Please select an agent.");
      return;
    }

    try {
      setAssigningAgent(true);
      setAssignError("");
      setAssignMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setAssignError("Please log in again.");
        return;
      }

      const response = await api.patch(
        `/api/v1/tickets/${ticketId}/assign`,
        { assigneeId: selectedAgent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTicket((current) =>
        current ? { ...current, assigneeId: selectedAgent } : current,
      );

      setAssignMessage(response.data.message || "Agent assigned successfully.");
    } catch (err) {
      console.error("Failed to assign agent:", err);
      setAssignError("Unable to assign agent. Please try again.");
    } finally {
      setAssigningAgent(false);
    }
  };

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
        {/* Ticket Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Ticket Details</p>

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

        {/* Description */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">Description</h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {ticket.description}
          </p>
        </section>

        <div className="my-6 border-t border-gray-200" />

        {/* Ticket Information */}
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
              <p className="text-xs font-medium text-gray-500">
                Assigned Agent
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {agents.find((agent) => agent.id === ticket.assigneeId)?.name ||
                  (ticket.assigneeId ? "Agent assigned" : "Unassigned")}
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

        {/* Assign Agent - AGENT and ADMIN only */}
        {(currentUserRole === "AGENT" || currentUserRole === "ADMIN") && (
          <>
            <div className="my-6 border-t border-gray-200" />

            <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900">
                Assign Agent
              </h2>

              {loadingAgents ? (
                <p className="text-sm text-gray-600">Loading agents...</p>
              ) : agents.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No agents are currently available.
                </p>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    disabled={assigningAgent}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
                  >
                    <option value="">Select an agent</option>

                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAssignAgent}
                    disabled={assigningAgent || !selectedAgent}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigningAgent ? "Assigning..." : "Assign Agent"}
                  </button>
                </div>
              )}

              {assignMessage && (
                <p className="mt-3 text-sm font-medium text-green-700">
                  {assignMessage}
                </p>
              )}

              {assignError && (
                <p className="mt-3 text-sm font-medium text-red-700">
                  {assignError}
                </p>
              )}
            </section>
          </>
        )}

        <div className="my-6 border-t border-gray-200" />

        {/* Manage Ticket Status */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Manage Ticket Status
          </h2>

          <select
            value={ticket.status}
            disabled={updatingStatus}
            onChange={(e) =>
              handleStatusUpdate(e.target.value as Ticket["status"])
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-50 sm:max-w-xs"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {updatingStatus && (
            <p className="mt-2 text-sm text-blue-700">Updating status...</p>
          )}

          {statusMessage && (
            <p className="mt-2 text-sm font-medium text-green-700">
              {statusMessage}
            </p>
          )}

          {statusError && (
            <p className="mt-2 text-sm font-medium text-red-700">
              {statusError}
            </p>
          )}
        </section>

        <div className="my-6 border-t border-gray-200" />

        {/* Comments */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">Comments</h2>

          <div className="mt-4 space-y-4">
            {loadingComments ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">
                No comments yet. Start the conversation.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.author.name}
                      </span>

                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {comment.author.role}
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="mt-6">
            <label
              htmlFor="comment"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Add a comment
            </label>

            <textarea
              id="comment"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment here..."
              disabled={submittingComment}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />

            {commentError && (
              <p className="mt-2 text-sm font-medium text-red-700">
                {commentError}
              </p>
            )}

            {commentSuccess && (
              <p className="mt-2 text-sm font-medium text-green-700">
                {commentSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingComment ? "Sending..." : "Send Comment"}
            </button>
          </form>
        </section>

        {/* AI Assistance */}
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
