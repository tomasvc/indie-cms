import { format } from "date-fns";
import type { Invoice } from "@/types";

type InvoiceState = Pick<Invoice, "status" | "due_date">;

/** New invoices are issued today and due this many days later. */
export const DEFAULT_PAYMENT_TERMS_DAYS = 30;

export type InvoiceDisplayStatus = Invoice["status"] | "overdue";

const todayISO = () => format(new Date(), "yyyy-MM-dd");

/** Sent and paid invoices count as billed; drafts and voided invoices don't. */
export function isBilled(invoice: Pick<Invoice, "status">) {
    return invoice.status === "sent" || invoice.status === "paid";
}

/** Money received. A sent invoice is outstanding, not revenue. */
export function isRevenue(invoice: Pick<Invoice, "status">) {
    return invoice.status === "paid";
}

/** Sent to the client and not yet paid. */
export function isOutstanding(invoice: Pick<Invoice, "status">) {
    return invoice.status === "sent";
}

export function isOverdue(invoice: InvoiceState, today = todayISO()) {
    return isOutstanding(invoice) && !!invoice.due_date && invoice.due_date.slice(0, 10) < today;
}

export function displayStatus(invoice: InvoiceState): InvoiceDisplayStatus {
    return isOverdue(invoice) ? "overdue" : invoice.status;
}

export function invoiceTotal(invoice: { total?: number | null }) {
    const n = Number(invoice.total);
    return Number.isFinite(n) ? n : 0;
}
