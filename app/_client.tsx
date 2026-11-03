"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface HealthResponse {
  success: boolean;
  message: string;
}

export default function HomeClient() {
  const { data, isLoading, isError, error } = useQuery<HealthResponse>({
    queryKey: ["backend-health"],
    queryFn: async () => {
      const response = await api.get("/api/v1/health");
      return response.data;
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">SupportPilot AI</h1>

      {isLoading && <p>Connecting to backend...</p>}

      {isError && (
        <div className="text-center text-red-500">
          <p>Backend connection failed!</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {data?.success && (
        <div className="text-center">
          <p className="text-green-600">Backend connected successfully!</p>
          <p>{data.message}</p>
        </div>
      )}
    </main>
  );
}
