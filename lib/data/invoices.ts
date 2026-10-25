import { createClient } from "@/lib/supabase/server";

export async function getInvoices(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
}

export async function getInvoice(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
        
    if (error) throw error;
    return data;
}

export async function countInvoicesForProject(projectId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { count, error } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("project_id", projectId)
        .eq("user_id", user.id);

    if (error) throw error;
    return count ?? 0;
}
