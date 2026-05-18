import { createClient } from "@/lib/supabase/server";

export async function getInvoices(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("*").eq("user_id", userId);
    if (error) throw error;
    return data;
}

export async function getInvoice(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
}
