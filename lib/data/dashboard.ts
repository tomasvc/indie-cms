import { createClient } from "@/lib/supabase/server";

export type DashboardCoreData = {
    projects: Awaited<ReturnType<typeof fetchProjects>>;
    invoices: Awaited<ReturnType<typeof fetchInvoices>>;
    clients: Awaited<ReturnType<typeof fetchClients>>;
    tasks: Awaited<ReturnType<typeof fetchTasks>>;
    /** Billable time not yet on an invoice. */
    unbilledTime: Awaited<ReturnType<typeof fetchUnbilledTime>>;
    portfolio: Awaited<ReturnType<typeof fetchPortfolio>> | null;
};

async function fetchProjects(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("id, title, status, priority, progress, value, currency, due_date, client_id, billing_type, hourly_rate, created_at, updated_at")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchInvoices(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("invoices")
        .select("id, user_id, project_id, client_id, code, currency, subtotal, total, status, due_date, issue_date, paid_date, sent_at, pdf_url, created_at, updated_at")
        .eq("user_id", userId)
        .order("issue_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

async function fetchClients(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("clients")
        .select("id, user_id, name, company, email, status, total_billed, last_contact, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchTasks(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tasks")
        .select("id, project_id, title, description, status, priority, due_date, completed_date, is_overdue, created_at, projects!inner(user_id)")
        .eq("projects.user_id", userId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
}

async function fetchUnbilledTime(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("time_entries")
        .select("id, project_id, hours, rate, entry_date")
        .eq("user_id", userId)
        .is("invoice_id", null)
        .or("billable.is.null,billable.eq.true");

    if (error) throw error;
    return data ?? [];
}

async function fetchPortfolio(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("portfolio")
        .select("id, title, slug, description, thumbnail_url, live_url, view_count, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) return [];
    return data ?? [];
}

export async function getDashboardCoreData(userId: string) {
    const [projects, invoices, clients, tasks, unbilledTime, portfolio] = await Promise.all([
        fetchProjects(userId),
        fetchInvoices(userId),
        fetchClients(userId),
        fetchTasks(userId),
        fetchUnbilledTime(userId),
        fetchPortfolio(userId),
    ]);

    return { projects, invoices, clients, tasks, unbilledTime, portfolio };
}
