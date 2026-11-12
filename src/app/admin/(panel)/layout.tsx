import type { Metadata } from "next";
import { AdminSidebar, AdminTabBar, AdminTopbar } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "eVerify Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-sand lg:pl-64">
      <AdminSidebar />
      <AdminTopbar />
      <main className="px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-8 lg:pb-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <AdminTabBar />
    </div>
  );
}
