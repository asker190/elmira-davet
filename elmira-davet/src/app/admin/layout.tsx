import type { Metadata } from "next";
import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: {
    default: "Yönetim Paneli",
    template: "%s | Elmira Davet Yönetim",
  },
  robots: {
    index: false,
    follow: false,
  },
};

import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToastProvider />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
