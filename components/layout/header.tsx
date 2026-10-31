
import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 md:flex">
          <Search size={17} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-48 text-sm outline-none"
          />
        </div>

        <button aria-label="Notifications">
          <Bell size={20} className="text-gray-600" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          A
        </div>
      </div>
    </header>
  );
}
