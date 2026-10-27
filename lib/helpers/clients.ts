import type { Client, Invoice } from "@/types";
import { invoiceTotal, isBilled, isOutstanding, isRevenue } from "@/lib/helpers/invoices";
import type { MoneyByCurrency } from "@/lib/money";

/** One way to name a client everywhere: the business first, then the contact person. */
export function clientLabel(client: Pick<Client, "name" | "company"> | null | undefined, fallback = "—") {
    if (!client) return fallback;
    const company = client.company?.trim();
    return company && company !== client.name ? `${company} (${client.name})` : client.name;
}

export type ClientTotals = {
    /** Sent and paid invoices. */
    billed: MoneyByCurrency;
    paid: MoneyByCurrency;
    /** Sent and not yet paid. */
    owed: MoneyByCurrency;
    invoiceCount: number;
};

const emptyTotals = (): ClientTotals => ({ billed: {}, paid: {}, owed: {}, invoiceCount: 0 });

function add(totals: MoneyByCurrency, currency: string, amount: number) {
    totals[currency] = (totals[currency] ?? 0) + amount;
}

/** Per-client money, worked out from invoices so it always matches the invoices list. */
export function getClientTotals(invoices: Array<Pick<Invoice, "client_id" | "status" | "total" | "currency">>) {
    const byClient: Record<string, ClientTotals> = {};
    for (const invoice of invoices) {
        if (!isBilled(invoice)) continue;
        const totals = (byClient[invoice.client_id] ??= emptyTotals());
        const currency = invoice.currency || "USD";
        const amount = invoiceTotal(invoice);
        add(totals.billed, currency, amount);
        if (isRevenue(invoice)) add(totals.paid, currency, amount);
        if (isOutstanding(invoice)) add(totals.owed, currency, amount);
        totals.invoiceCount += 1;
    }
    return byClient;
}

export function totalsFor(byClient: Record<string, ClientTotals>, clientId: string) {
    return byClient[clientId] ?? emptyTotals();
}

const STATUS_ORDER: Record<Client["status"], number> = { active: 0, lead: 1, archived: 2 };

/** Active clients first, then leads, then archived; alphabetical within each. */
export function sortClients<T extends Pick<Client, "status" | "name" | "company">>(clients: T[]) {
    return [...clients].sort(
        (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3) || clientLabel(a).localeCompare(clientLabel(b))
    );
}
