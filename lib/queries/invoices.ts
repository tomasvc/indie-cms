import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, LineItem } from "@/types";

export type InvoiceWithLineItems = Invoice & { items: LineItem[] };

export const invoicesQuery = queryOptions({
    queryKey: ["invoices"],
    queryFn: async () => {
        const { data, error } = await createClient()
            .from("invoices")
            .select("*")
            .order("issue_date", { ascending: false, nullsFirst: false });
        if (error) throw error;
        return (data ?? []) as Invoice[];
    },
});

export const invoiceQuery = (id: string) =>
    queryOptions({
        queryKey: ["invoices", id],
        queryFn: async () => {
            const { data, error } = await createClient()
                .from("invoices")
                .select("*, items:line_items(*)")
                .eq("id", id)
                .order("position", { referencedTable: "items" })
                .maybeSingle();
            if (error) throw error;
            return data as InvoiceWithLineItems | null;
        },
    });

/** Suggests the user's next reference number from the highest trailing number in their existing codes. */
export function nextInvoiceCode(invoices: Pick<Invoice, "code">[]) {
    const highest = invoices.reduce((max, { code }) => {
        const n = Number(/(\d+)$/.exec(code ?? "")?.[1] ?? 0);
        return Number.isSafeInteger(n) && n > max ? n : max;
    }, 0);
    return String(highest + 1).padStart(4, "0");
}
