import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { TopStats } from "@/components/top-stats";
import { Financials } from "@/components/financials";

import { getDashboardCoreData } from "@/lib/queries/dashboard";
import { getMockDashboardCoreData } from "@/lib/mock";
import { Workload } from "@/components/workload";
import { QuickActions } from "@/components/quick-actions";
import { RecentActivity } from "@/components/recent-activity";
import { OverdueInvoices } from "@/components/overdue-invoices";

// async function UserDetails() {
//   const supabase = await createClient();
//   const { data, error } = await supabase.auth.getClaims();

//   if (error || !data?.claims) {
//     redirect("/auth/login");
//   }

//   return JSON.stringify(data.claims, null, 2);
// }

async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const coreData =
    process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === "true"
      ? getMockDashboardCoreData(user.id)
      : await getDashboardCoreData(user.id);

  return (
    <div className="flex-1 w-full flex flex-col gap-4">
      <TopStats data={coreData} />
      <div className="grid grid-cols-4 gap-4">
        <Financials data={coreData} />
        <Workload data={coreData} />
        <QuickActions />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <RecentActivity />
        <OverdueInvoices data={coreData} />
      </div>
      {/* <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div> */}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
      <Dashboard />
    </Suspense>
  );
}
