import type { Metadata } from "next";
import { DashboardContent } from "@/app/(authenticated)/dashboard/(components)/dashboard-content";

export default function DashboardPage() {
  return <DashboardContent />;
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Revenue, unbilled work, project workload, and unpaid invoices at a glance.",
}
