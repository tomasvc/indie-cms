import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { TopStats } from "@/app/(authenticated)/dashboard/(components)/top-stats";
import { Financials } from "@/app/(authenticated)/dashboard/(components)/financials";

import { getDashboardCoreData } from "@/lib/data/dashboard";
import { Workload } from "@/app/(authenticated)/dashboard/(components)/workload";
import { NeedsAttention } from "@/app/(authenticated)/dashboard/(components)/needs-attention";
import { SinceLastVisit } from "@/app/(authenticated)/dashboard/(components)/since-last-visit";
import { LogTimeButton } from "@/app/(authenticated)/dashboard/(components)/log-time-button";
import { RecentActivity } from "@/app/(authenticated)/dashboard/(components)/recent-activity";
import { OverdueInvoices } from "@/app/(authenticated)/dashboard/(components)/overdue-invoices";
import { DashboardFallback } from "@/app/(authenticated)/dashboard/(components)/dashboard-fallback";
import type { Metadata } from "next";
import { getProfile } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { FolderPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const profile = await getProfile();

  if (!profile) {
    redirect('/settings')
  }

  const locale = profile.language || "en";

  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === "true";
  const [coreData, previousVisit] = await Promise.all([
    useMock ? (await import("@/lib/mock")).getMockDashboardCoreData(user.id) : getDashboardCoreData(user.id),
    // Records this visit and returns when the previous one started (for "since your last visit")
    useMock ? null : supabase.rpc("record_dashboard_visit").then(({ data }) => (data as string | null) ?? null),
  ]);

  const today = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  // Reading order follows the morning routine: what to act on, money, this week's work, then insights.
  return (
    <div className="flex-1 w-full flex flex-col gap-3 animate-fadein">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <div>
          <Typography variant="pageTitle" as="h1">Dashboard</Typography>
          <p className="mt-1 text-[15px] text-muted-foreground">{today}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LogTimeButton
            projects={coreData.projects
              .filter((project) => project.status === "active" || project.status === "review")
              .map((project) => ({ id: project.id, title: project.title, currency: project.currency, hourly_rate: project.hourly_rate }))}
            profileRate={Number(profile.hourly_rate) > 0 ? Number(profile.hourly_rate) : 0}
          />
          <Button asChild variant="outline">
            <Link href="/projects/new">
              <FolderPlusIcon aria-hidden />
              New Project
            </Link>
          </Button>
          <Button asChild>
            <Link href="/invoices/new">
              <PlusIcon aria-hidden />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>
      <SinceLastVisit data={coreData} previousVisit={previousVisit} locale={locale} currency={profile.currency || "USD"} />
      <NeedsAttention data={coreData} locale={locale} />
      <TopStats data={coreData} profile={profile} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Workload data={coreData} locale={locale} />
        <Financials data={coreData} profile={profile} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <OverdueInvoices data={coreData} locale={locale} />
        <RecentActivity coreData={coreData} locale={locale} />
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
  description: "Revenue, unbilled work, project workload, and unpaid invoices at a glance.",
}