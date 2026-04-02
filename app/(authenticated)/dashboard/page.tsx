import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { TopStats } from "@/app/(authenticated)/dashboard/(components)/top-stats";
import { Financials } from "@/app/(authenticated)/dashboard/(components)/financials";

import { getDashboardCoreData } from "@/lib/queries/dashboard";
import { getMockDashboardCoreData } from "@/lib/mock";
import { Workload } from "@/app/(authenticated)/dashboard/(components)/workload";
import { QuickActions } from "@/app/(authenticated)/dashboard/(components)/quick-actions";
import { RecentActivity } from "@/app/(authenticated)/dashboard/(components)/recent-activity";
import { OverdueInvoices } from "@/app/(authenticated)/dashboard/(components)/overdue-invoices";
import { DashboardFallback } from "@/app/(authenticated)/dashboard/(components)/dashboard-fallback";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getProfile } from "@/lib/actions/settings";

async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getProfile();

  if (!profile) {
    redirect('/settings')
  }

  if (!user) {
    redirect('/auth/login')
  }

  const coreData =
    process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === "true"
      ? getMockDashboardCoreData(user.id)
      : await getDashboardCoreData(user.id);

  return (
    <div className="flex-1 w-full flex flex-col gap-3 animate-fadein">
      <TopStats data={coreData} profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-y-3 gap-x-0 lg:gap-x-3">
        <Financials data={coreData} />
        <Workload data={coreData} userId={user.id} />
        <QuickActions />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-y-3 gap-x-0 xl:gap-x-3">
        <RecentActivity coreData={coreData} />
        <OverdueInvoices data={coreData} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard />
    </Suspense>
  );
}

export const metadata: Metadata = {
  title: "Dashboard",
  description: "This is your dashboard. Here you can see your top stats, financials, workload, recent activity, and overdue invoices.",
}