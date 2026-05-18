import { createClient } from "@/lib/supabase/server";
import type { TimeEntry } from "@/types";

export async function getTimeEntriesForProject(projectId: string): Promise<TimeEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("time_entries")
        .select("id, project_id, user_id, invoice_id, task_id, description, hours, rate, approved, billable, entry_date, created_at")
        .eq("project_id", projectId)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row) => ({
        id: row.id,
        project_id: row.project_id,
        user_id: row.user_id,
        invoice_id: row.invoice_id ?? undefined,
        task_id: row.task_id ?? undefined,
        description: row.description ?? undefined,
        hours: Number(row.hours),
        rate: Number(row.rate),
        approved: Boolean(row.approved),
        billable: Boolean(row.billable),
        entry_date: row.entry_date ?? "",
        created_at: row.created_at ?? "",
    }));
}
