
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Users,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

type Role = "CUSTOMER" | "AGENT" | "ADMIN";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type UsersResponse = {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type RoleUpdateResponse = {
  success: boolean;
  message: string;
  data: User;
};

function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Statistics skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-4 h-9 w-16 rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-12 rounded bg-gray-200" />
            <div className="h-4 w-14 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-4 sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-32 max-w-full rounded bg-gray-200" />
                  <div className="h-3 w-40 max-w-full rounded bg-gray-100" />
                </div>
              </div>

              <div className="h-6 w-20 rounded-full bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-100" />
              <div className="h-8 w-28 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-9 w-48 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState("");

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await api.get<UsersResponse>(
        `/api/v1/users?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = response.data.data;

      setUsers(result.users);
      setTotalUsers(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Unable to load user information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function handleRoleChange(user: User) {
    const newRole: Role =
      user.role === "CUSTOMER" ? "AGENT" : "CUSTOMER";

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role from ${user.role} to ${newRole}?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingUserId(user.id);
      setActionMessage("");
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const response = await api.put<RoleUpdateResponse>(
        `/api/v1/users/${user.id}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUser = response.data.data;

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === updatedUser.id ? updatedUser : item,
        ),
      );

      setActionMessage(response.data.message);
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError("Unable to update user role. Please try again.");
    } finally {
      setUpdatingUserId("");
    }
  }

  const customerCount = users.filter(
    (user) => user.role === "CUSTOMER",
  ).length;

  const staffCount = users.filter(
    (user) => user.role === "AGENT" || user.role === "ADMIN",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              User Management
            </h1>
            <ShieldCheck size={20} className="text-purple-600" />
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Manage users and control account roles.
          </p>
        </div>

        <button
          onClick={fetchUsers}
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
            <p className="text-sm font-medium text-red-700">{error}</p>
            {!loading && (
              <button
                onClick={fetchUsers}
                className="mt-2 text-sm font-semibold text-red-700 underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {actionMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            {actionMessage}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <UsersLoading />
      ) : error && users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm text-gray-600">
            We couldn't load the users.
          </p>
          <button
            onClick={fetchUsers}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Users size={32} className="mx-auto text-gray-400" />
          <h2 className="mt-3 font-semibold text-gray-900">
            No users found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            There are no users to display on this page.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Total Users
                </p>
                <Users size={18} className="text-gray-400" />
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">
                Customers (This Page)
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-blue-700">
                {customerCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">
                Staff (This Page)
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-purple-700">
                {staffCount}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                All Users
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                View account details and manage user permissions.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      User
                    </th>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Joined
                    </th>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <span className="text-sm font-bold text-blue-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {user.name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "AGENT"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.role === "ADMIN" ? (
                          <span className="text-xs font-medium text-gray-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(user)}
                            disabled={updatingUserId !== ""}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.role === "CUSTOMER"
                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {updatingUserId === user.id
                              ? "Updating..."
                              : user.role === "CUSTOMER"
                                ? "Promote to Agent"
                                : "Demote to Customer"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing page {page} of {totalPages} ({totalUsers} users)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1 || loading}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="px-2 text-sm font-medium text-gray-700">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
