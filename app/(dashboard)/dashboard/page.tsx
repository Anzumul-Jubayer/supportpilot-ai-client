
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    title: "Total Tickets",
    value: "128",
    icon: Ticket,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Open Tickets",
    value: "24",
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "In Progress",
    value: "18",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Resolved",
    value: "86",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to SupportPilot AI
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your support activity.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Your recent support ticket activity will appear here.
        </p>
      </div>
    </div>
  );
}
