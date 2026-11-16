"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FolderPlusIcon, PlusIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { dashboardQuery, dashboardVisitQuery } from "@/lib/queries/dashboard";
import { profileQuery } from "@/lib/queries/account";
import { TopStats } from "./top-stats";
import { Financials } from "./financials";
import { Workload } from "./workload";
import { NeedsAttention } from "./needs-attention";
import { SinceLastVisit } from "./since-last-visit";
import { LogTimeButton } from "./log-time-button";
import { RecentActivity } from "./recent-activity";
import { OverdueInvoices } from "./overdue-invoices";
import { DashboardFallback } from "./dashboard-fallback";
import { CreateProjectDialog } from "../../projects/(components)/create-project-dialog";

export function DashboardContent() {
  const { data: profile } = useQuery(profileQuery);
  const { data: coreData } = useQuery(dashboardQuery);
  const { data: previousVisit } = useQuery(dashboardVisitQuery);

  if (profile === null) redirect("/settings");
  if (!profile || !coreData || previousVisit === undefined) return <DashboardFallback />;

  const locale = profile.language || "en";
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
          <CreateProjectDialog
            trigger={
              <Button variant="outline">
                <FolderPlusIcon aria-hidden />
                New Project
              </Button>
            }
          />
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
