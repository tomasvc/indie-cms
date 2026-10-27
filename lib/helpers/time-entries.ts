import type { TimeEntry } from "@/types";
import type { LineItemValues } from "@/lib/schemas/invoice";

type BillableState = Pick<TimeEntry, "billable" | "invoice_id">;

/** Billable time that isn't on an invoice yet. */
export function isUnbilled(entry: BillableState) {
    return entry.billable !== false && !entry.invoice_id;
}

export function unbilledAmount(entries: Array<BillableState & Pick<TimeEntry, "hours" | "rate">>) {
    return entries.filter(isUnbilled).reduce((sum, entry) => sum + Number(entry.hours) * Number(entry.rate), 0);
}

/** One invoice line per entry, oldest first, so the client can see exactly what was billed. */
export function timeEntriesToLineItems(entries: Array<Pick<TimeEntry, "description" | "hours" | "rate" | "entry_date">>): LineItemValues[] {
    return [...entries]
        .sort((a, b) => (a.entry_date ?? "").localeCompare(b.entry_date ?? ""))
        .map((entry) => ({
            description: [entry.entry_date?.slice(0, 10), entry.description || "Time"].filter(Boolean).join(" · "),
            quantity: Number(entry.hours),
            unit: "hrs" as const,
            unitPrice: Number(entry.rate),
        }));
}
