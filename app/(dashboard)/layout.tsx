import AuthGuard from "@/components/providers/auth-guard";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
