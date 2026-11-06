"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Ticket,
  CalendarDays,
  User,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Send,
  Sparkles,
  RefreshCw,
  Bot,
  FileText,
  ChevronDown,
  Copy,
} from "lucide-react";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  aiPriority: TicketPriority | null;
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

type AIAnalysisResponse = {
  success: boolean;
  message: string;
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

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    color: string;
    icon: ReactNode;
  }
> = {
  OPEN: {
    label: "Open",
    color: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: <AlertCircle size={14} />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: <Clock size={14} />,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: <CheckCircle size={14} />,
  },
  CLOSED: {
    label: "Closed",
    color: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    icon: <XCircle size={14} />,
  },
};

const priorityConfig: Record<
  TicketPriority,
  {
    label: string;
    color: string;
    dot: string;
  }
> = {
  LOW: {
    label: "Low",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  HIGH: {
    label: "High",
    color: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  URGENT: {
    label: "Urgent",
    color: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown date";
  }

  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

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

  // AI states
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

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

  // Fetch current user and available agents
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

  // Fetch ticket comments
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

  // Submit a comment
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
  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket || newStatus === ticket.status) return;

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

  // Assign an agent
  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      setAssignError("Please select an agent.");
      return;
    }

    if (selectedAgent === ticket?.assigneeId) {
      setAssignError("This agent is already assigned to the ticket.");
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

      setAssignMessage(
        response.data.message || "Agent assigned successfully.",
      );
    } catch (err) {
      console.error("Failed to assign agent:", err);
      setAssignError("Unable to assign agent. Please try again.");
    } finally {
      setAssigningAgent(false);
    }
  };

  // Analyze ticket with AI
  const handleAnalyzeTicket = async () => {
    try {
      setAnalyzingAI(true);
      setAiError("");
      setAiMessage("");
      setCopySuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setAiError("Please log in again.");
        return;
      }

      const response = await api.post<AIAnalysisResponse>(
        `/api/v1/ai/tickets/${ticketId}/analyze`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTicket(response.data.data);
      setAiMessage(response.data.message || "Ticket analyzed successfully!");
    } catch (err) {
      console.error("AI analysis failed:", err);

      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setAiError(
        error.response?.data?.message ||
          "Unable to analyze ticket. Please try again.",
      );
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Copy AI suggested reply
  const handleCopyReply = async () => {
    if (!ticket?.aiReply) return;

    try {
      await navigator.clipboard.writeText(ticket.aiReply);
      setCopySuccess("AI reply copied successfully!");
    } catch {
      setCopySuccess("Unable to copy reply.");
    }
  };

  const currentStatus = ticket ? statusConfig[ticket.status] : null;
  const currentPriority = ticket ? priorityConfig[ticket.priority] : null;

  const assignedAgent = agents.find(
    (agent) => agent.id === ticket?.assigneeId,
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent" />

        <p className="mt-4 text-sm font-medium text-gray-500">
          Loading ticket details...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !ticket || !currentStatus || !currentPriority) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-center shadow-sm">
        <div className="rounded-full bg-red-50 p-4">
          <AlertCircle size={30} className="text-red-500" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-gray-900">
          Unable to display ticket
        </h2>

        <p className="mt-2 max-w-sm text-sm text-gray-500">
          {error || "Ticket not found."}
        </p>

        <button
          type="button"
          onClick={() => router.push("/dashboard/tickets")}
          className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb and navigation */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/tickets")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </button>
      </div>

      {/* Ticket header */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
                  #{ticket.id.slice(0, 8).toUpperCase()}
                </span>

                <span className="text-xs text-gray-400">
                  Ticket Details
                </span>
              </div>

              <h1 className="mt-4 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {ticket.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Review the request, manage its progress, and communicate with
                the customer.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ${currentStatus.color}`}
              >
                {currentStatus.icon}
                {currentStatus.label}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${currentPriority.color}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${currentPriority.dot}`}
                />
                {currentPriority.label} Priority
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-gray-100 bg-gray-50/70 sm:grid-cols-3">
          <div className="border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarDays size={15} />
              <span className="text-xs font-medium">Created</span>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-800">
              {formatDate(ticket.createdAt)}
            </p>
          </div>

          <div className="border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
            <div className="flex items-center gap-2 text-gray-400">
              <RefreshCw size={15} />
              <span className="text-xs font-medium">Last Updated</span>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-800">
              {formatDate(ticket.updatedAt)}
            </p>
          </div>

          <div className="px-5 py-4 sm:px-7">
            <div className="flex items-center gap-2 text-gray-400">
              <User size={15} />
              <span className="text-xs font-medium">Assigned Agent</span>
            </div>

            <p className="mt-2 text-sm font-semibold text-gray-800">
              {assignedAgent?.name ||
                (ticket.assigneeId ? "Agent assigned" : "Unassigned")}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle
              icon={<FileText size={19} />}
              title="Ticket Description"
              description="Details provided by the customer"
            />

            <div className="mt-5 rounded-xl bg-gray-50 p-4 sm:p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                {ticket.description}
              </p>
            </div>
          </section>

          {/* Comments */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle
                icon={<MessageSquare size={19} />}
                title="Conversation"
                description="Comments and updates on this ticket"
              />

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {comments.length} comments
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {loadingComments ? (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Loading comments...
                </div>
              ) : commentError && comments.length === 0 ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {commentError}
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                  <MessageSquare
                    size={25}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No comments yet
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Start the conversation by adding the first comment.
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {comment.author.name}
                          </p>

                          <span className="mt-0.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {comment.author.role}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-900">
                Add a comment
              </h3>

              <form onSubmit={handleSubmitComment} className="mt-3">
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your message here..."
                  disabled={submittingComment}
                  className={fieldClass + " resize-none"}
                />

                {commentError && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {commentError}
                  </p>
                )}

                {commentSuccess && (
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    {commentSuccess}
                  </p>
                )}

                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingComment ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Comment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* AI Assistance */}
          {(currentUserRole === "AGENT" || currentUserRole === "ADMIN") && (
            <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle
                  icon={<Sparkles size={19} />}
                  title="AI Assistance"
                  description="AI-powered insights and suggested responses"
                />

                <button
                  type="button"
                  onClick={handleAnalyzeTicket}
                  disabled={analyzingAI}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzingAI ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {ticket.aiSummary ? "Analyze Again" : "Analyze with AI"}
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {aiError}
                </p>
              )}

              {aiMessage && (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  {aiMessage}
                </p>
              )}

              {/* AI Recommended Priority */}
              {ticket.aiPriority && (
                <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                  <p className="text-xs font-semibold text-gray-500">
                    AI Recommended Priority
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                      priorityConfig[ticket.aiPriority].color
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        priorityConfig[ticket.aiPriority].dot
                      }`}
                    />
                    {priorityConfig[ticket.aiPriority].label}
                  </span>
                </div>
              )}

              {/* AI Summary */}
              {ticket.aiSummary && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Bot size={17} className="text-blue-600" />

                    <h3 className="text-sm font-bold text-blue-900">
                      AI Summary
                    </h3>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-blue-900/80">
                    {ticket.aiSummary}
                  </p>
                </div>
              )}

              {/* AI Suggested Reply */}
              {ticket.aiReply && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        size={17}
                        className="text-emerald-600"
                      />

                      <h3 className="text-sm font-bold text-emerald-900">
                        AI Suggested Reply
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyReply}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <Copy size={14} />
                      Copy Reply
                    </button>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-emerald-900/80">
                    {ticket.aiReply}
                  </p>

                  {copySuccess && (
                    <p className="mt-3 text-xs font-medium text-emerald-700">
                      {copySuccess}
                    </p>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!ticket.aiSummary &&
                !ticket.aiReply &&
                !ticket.aiPriority &&
                !analyzingAI && (
                  <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <Sparkles
                      size={25}
                      className="mx-auto text-gray-400"
                    />

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      No AI analysis yet
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Click Analyze with AI to generate insights for this
                      ticket.
                    </p>
                  </div>
                )}
            </section>
          )}
        </div>

        {/* Right column */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          {/* Ticket information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <SectionTitle
              icon={<Ticket size={19} />}
              title="Ticket Information"
            />

            <div className="mt-6 space-y-5">
              <InfoItem
                icon={<Tag size={16} />}
                label="Category"
                value={ticket.category || "Not assigned"}
              />

              <InfoItem
                icon={<User size={16} />}
                label="Creator ID"
                value={ticket.creatorId}
              />

              <InfoItem
                icon={<CalendarDays size={16} />}
                label="Created At"
                value={formatDate(ticket.createdAt)}
              />

              <InfoItem
                icon={<RefreshCw size={16} />}
                label="Last Updated"
                value={formatDate(ticket.updatedAt)}
              />
            </div>
          </section>

          {/* Agent assignment */}
          {(currentUserRole === "AGENT" || currentUserRole === "ADMIN") && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <SectionTitle
                icon={<Users size={19} />}
                title="Agent Assignment"
                description="Manage the agent responsible for this ticket"
              />

              <div className="mt-5">
                {loadingAgents ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading agents...
                  </div>
                ) : agents.length === 0 ? (
                  <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">
                    No agents are currently available.
                  </p>
                ) : (
                  <>
                    <label
                      htmlFor="assign-agent"
                      className="mb-2 block text-xs font-semibold text-gray-600"
                    >
                      Select an agent
                    </label>

                    <div className="relative">
                      <select
                        id="assign-agent"
                        value={selectedAgent}
                        onChange={(e) => {
                          setSelectedAgent(e.target.value);
                          setAssignError("");
                          setAssignMessage("");
                        }}
                        disabled={assigningAgent}
                        className={fieldClass + " appearance-none pr-10"}
                      >
                        <option value="">Select an agent</option>

                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAssignAgent}
                      disabled={
                        assigningAgent ||
                        !selectedAgent ||
                        selectedAgent === ticket.assigneeId
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assigningAgent ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Users size={15} />
                          Assign Agent
                        </>
                      )}
                    </button>
                  </>
                )}

                {assignMessage && (
                  <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    {assignMessage}
                  </p>
                )}

                {assignError && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
                    {assignError}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Status management */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <SectionTitle
              icon={<RefreshCw size={19} />}
              title="Manage Status"
              description="Update the current ticket progress"
            />

            <div className="mt-5">
              <label
                htmlFor="ticket-status"
                className="mb-2 block text-xs font-semibold text-gray-600"
              >
                Ticket status
              </label>

              <div className="relative">
                <select
                  id="ticket-status"
                  value={ticket.status}
                  disabled={updatingStatus}
                  onChange={(e) =>
                    handleStatusUpdate(e.target.value as TicketStatus)
                  }
                  className={fieldClass + " appearance-none pr-10"}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {updatingStatus && (
                <p className="mt-3 text-xs font-medium text-blue-600">
                  Updating ticket status...
                </p>
              )}

              {statusMessage && (
                <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                  {statusMessage}
                </p>
              )}

              {statusError && (
                <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
                  {statusError}
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}