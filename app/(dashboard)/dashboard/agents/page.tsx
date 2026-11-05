
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Ticket, RefreshCw, AlertCircle } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agent Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your support team's workload.
          </p>
        </div>

        <button
          onClick={fetchAgents}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-600">Loading agents...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchAgents}
            className="mt-4 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users className="mx-auto text-gray-400" size={32} />
          <h2 className="mt-3 font-semibold text-gray-900">
            No agents found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Promote a customer to AGENT from user management.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {agents.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Assigned Tickets</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {agents.reduce((sum, agent) => sum + agent.totalTickets, 0)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Open Workload</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {agents.reduce(
                  (sum, agent) =>
                    sum + agent.openTickets + agent.inProgressTickets,
                  0,
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
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
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                          <Users size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agent.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {agent.totalTickets}
                    </td>
                    <td className="px-5 py-4 text-blue-700">
                      {agent.openTickets}
                    </td>
                    <td className="px-5 py-4 text-amber-700">
                      {agent.inProgressTickets}
                    </td>
                    <td className="px-5 py-4 text-green-700">
                      {agent.resolvedTickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
