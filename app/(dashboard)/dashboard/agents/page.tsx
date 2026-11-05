
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  RefreshCw,
  AlertCircle,
  Ticket,
} from "lucide-react";

type Agent = {
  id: string;
  name: string;
  email: string;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
};

type AgentsResponse = {
  success: boolean;
  data: Agent[];
};

function AgentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Statistics Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-4 h-9 w-16 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Agent Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-52 rounded bg-gray-100" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-4 w-16 rounded bg-gray-200"
                />
              ))}
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="grid grid-cols-5 items-center gap-4 px-5 py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 rounded bg-gray-200" />
                      <div className="h-3 w-36 rounded bg-gray-100" />
                    </div>
                  </div>

                  {[1, 2, 3, 4].map((column) => (
                    <div
                      key={column}
                      className="h-5 w-10 rounded bg-gray-200"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAgents() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await api.get<AgentsResponse>(
        "/api/v1/users/agents/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAgents(response.data.data);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Unable to load agent information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  const totalTickets = agents.reduce(
    (sum, agent) => sum + agent.totalTickets,
    0,
  );

  const openWorkload = agents.reduce(
    (sum, agent) =>
      sum + agent.openTickets + agent.inProgressTickets,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Agent Management
            </h1>
            <Users size={20} className="text-blue-600" />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your support team's workload and performance.
          </p>
        </div>

        <button
          onClick={fetchAgents}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />
          <div>
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            {!loading && (
              <button
                onClick={fetchAgents}
                className="mt-2 text-sm font-semibold text-red-700 underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <AgentsLoading />
      ) : error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-600">
            We couldn't load agent information.
          </p>

          <button
            onClick={fetchAgents}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users size={32} className="mx-auto text-gray-400" />

          <h2 className="mt-3 font-semibold text-gray-900">
            No agents found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Promote a customer to AGENT from user management.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Total Agents
                </p>
                <Users size={18} className="text-gray-400" />
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {agents.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Assigned Tickets
                </p>
                <Ticket size={18} className="text-gray-400" />
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {totalTickets}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Open Workload
                </p>
                <Ticket size={18} className="text-blue-500" />
              </div>

              <p className="mt-3 text-3xl font-bold tracking-tight text-blue-700">
                {openWorkload}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Open + In Progress tickets
              </p>
            </div>
          </div>

          {/* Agents Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Support Team
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Overview of agent assignments and ticket status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Agent
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Total
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Open
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      In Progress
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Resolved
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <span className="text-sm font-bold text-blue-700">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {agent.name}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {agent.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {agent.totalTickets}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-blue-700">
                          {agent.openTickets}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-amber-700">
                          {agent.inProgressTickets}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-green-700">
                          {agent.resolvedTickets}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
