
import Link from "next/link";
import { Headset } from "lucide-react";

export default function AuthLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Headset size={24} />
          </div>

          <span className="text-xl font-bold text-slate-900">
            SupportPilot AI
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {description}
            </p>
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 SupportPilot AI. All rights reserved.
        </p>
      </div>
    </main>
  );
}
