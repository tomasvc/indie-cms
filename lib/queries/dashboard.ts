import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type DashboardCoreData = {
    projects: Awaited<ReturnType<typeof fetchProjects>>;
    invoices: Awaited<ReturnType<typeof fetchInvoices>>;
    clients: Awaited<ReturnType<typeof fetchClients>>;
    tasks: Awaited<ReturnType<typeof fetchTasks>>;
    /** Billable time not yet on an invoice. */
    unbilledTime: Awaited<ReturnType<typeof fetchUnbilledTime>>;
    portfolio: Awaited<ReturnType<typeof fetchPortfolio>> | null;
};

async function fetchProjects() {
    const { data, error } = await createClient()
        .from("projects")
        .select("id, title, status, priority, progress, value, currency, due_date, client_id, billing_type, hourly_rate, created_at, updated_at")
        .order("due_date", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchInvoices() {
    const { data, error } = await createClient()
        .from("invoices")
        .select("id, user_id, project_id, client_id, code, currency, subtotal, total, status, due_date, issue_date, paid_date, sent_at, pdf_url, created_at, updated_at")
        .order("issue_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

async function fetchClients() {
    const { data, error } = await createClient()
        .from("clients")
        .select("id, user_id, name, company, email, status, total_billed, last_contact, created_at, updated_at")
        .order("updated_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchTasks() {
    const { data, error } = await createClient()
        .from("tasks")
        .select("id, project_id, title, description, status, priority, due_date, completed_date, is_overdue, created_at")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchUnbilledTime() {
    const { data, error } = await createClient()
        .from("time_entries")
        .select("id, project_id, hours, rate, entry_date")
        .is("invoice_id", null)
        .or("billable.is.null,billable.eq.true");

    if (error) throw error;
    return data ?? [];
}

async function fetchPortfolio() {
    const { data, error } = await createClient()
        .from("portfolio")
        .select("id, title, slug, description, thumbnail_url, live_url, view_count, created_at")
        .order("created_at", { ascending: true });

    if (error) return [];
    return data ?? [];
}

async function getDashboardCoreData(): Promise<DashboardCoreData> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === "true") {
        return (await import("@/lib/mock")).getMockDashboardCoreData("mock-user");
    }

    const [projects, invoices, clients, tasks, unbilledTime, portfolio] = await Promise.all([
        fetchProjects(),
        fetchInvoices(),
        fetchClients(),
        fetchTasks(),
        fetchUnbilledTime(),
        fetchPortfolio(),
    ]);

    return { projects, invoices, clients, tasks, unbilledTime, portfolio };
}

export const dashboardQuery = queryOptions({
    queryKey: ["dashboard"],
    queryFn: getDashboardCoreData,
});

/** Records this visit and returns when the previous one started (for "since your last visit"). */
export const dashboardVisitQuery = queryOptions({
    queryKey: ["dashboard-visit"],
    queryFn: async () => {
        if (process.env.NEXT_PUBLIC_USE_MOCK_DASHBOARD === "true") return null;
        const { data } = await createClient().rpc("record_dashboard_visit");
        return (data as string | null) ?? null;
    },
});
