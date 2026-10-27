import { createClient } from "@/lib/supabase/server";
import type { Invoice, LineItem } from "@/types";

export type InvoiceWithLineItems = Invoice & { items: LineItem[] };

export async function getInvoices(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("issue_date", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data as Invoice[];
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

export async function getInvoiceWithLineItems(id: string): Promise<InvoiceWithLineItems | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("invoices")
        .select("*, items:line_items(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .order("position", { referencedTable: "items" })
        .maybeSingle();

    if (error) throw error;
    return data as InvoiceWithLineItems | null;
}

/** Suggests the user's next reference number from the highest trailing number in their existing codes. */
export async function getNextInvoiceCode(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from("invoices").select("code").eq("user_id", userId);
    if (error) throw error;

    const highest = (data ?? []).reduce((max, { code }) => {
        const n = Number(/(\d+)$/.exec(code ?? "")?.[1] ?? 0);
        return Number.isSafeInteger(n) && n > max ? n : max;
    }, 0);
    return String(highest + 1).padStart(4, "0");
}

export async function getInvoicesForProject(projectId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("issue_date", { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data ?? []) as Invoice[];
}
