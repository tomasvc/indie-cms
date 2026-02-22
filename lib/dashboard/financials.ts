import type { Client, Invoice } from "@/types";

export type FinancialSummary = {
    monthlyEarnings: number;
    previousMonthEarnings: number;
    outstanding: number;
    unpaidCount: number;
    avgDaysToPay: number | null;
};

const now = new Date();

const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

export function getFinancialSummary(invoices: Array<Invoice> | null): FinancialSummary {
    const list = invoices ?? [];

    const previousMonthInvoices = list.filter(invoice => {
        const paid = invoice.paid_date == null ? null : new Date(invoice.paid_date);
        return paid != null && paid >= startOfPreviousMonth && paid <= endOfPreviousMonth;
    });

    const previousMonthEarnings = previousMonthInvoices?.reduce(
        (acc, invoice) => acc + invoice.amount,
        0
    ) ?? 0;
    const thisMonthInvoices = list.filter(invoice => {
        const paid = invoice.paid_date == null ? null : new Date(invoice.paid_date);
        return paid != null && paid >= startOfMonth && paid <= endOfMonth;
    });

    const monthlyEarnings = thisMonthInvoices?.reduce(
        (acc, invoice) => acc + invoice.amount,
        0
    ) ?? 0;

    const outstanding = list.filter(invoice => invoice.paid_date === null).reduce(
        (acc, invoice) => acc + invoice.amount,
        0
    ) ?? 0;

    const paidInvoices = list.filter(
        (inv) => inv.paid_date != null && inv.issue_date != null
    ) ?? [];

    const unpaidInvoices = list.filter(
        (inv) => inv.paid_date === null && inv.issue_date != null
    ) ?? [];

    const totalDays = paidInvoices.reduce((acc, inv) => {
        const paid = new Date(inv.paid_date!);
        const issued = new Date(inv.issue_date!);
        const days = Math.round((paid.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
    }, 0);

    const avgDaysToPay = paidInvoices.length > 0 ? totalDays / paidInvoices.length : null;

    return { monthlyEarnings, previousMonthEarnings, outstanding, unpaidCount: unpaidInvoices.length, avgDaysToPay };
}

export function getClientFinancialBreakdown(
    clients: Array<Client> | null,
    invoices: Array<Invoice> | null
): Array<{ id: string; name: string; total_billed: number; count?: number }> {
    const thisMonthInvoices = (invoices ?? []).filter((inv) => {
        const paid = inv.paid_date == null ? null : new Date(inv.paid_date);
        return paid != null && paid >= startOfMonth && paid <= endOfMonth;
    });
    const thisMonthEarningsByClientId = thisMonthInvoices.reduce<Record<string, number>>((acc, inv) => {
        const id = inv.client_id;
        acc[id] = (acc[id] ?? 0) + inv.amount;
        return acc;
    }, {});

    const clientsWithMonthlyEarnings = (clients ?? [])
        .map((c) => ({ id: c.id, name: c.name, total_billed: thisMonthEarningsByClientId[c.id] ?? 0 }))
        .filter((c) => c.total_billed > 0)
        .sort((a, b) => b.total_billed - a.total_billed);

    const topThreeClients = clientsWithMonthlyEarnings.slice(0, 3);
    const otherClients = clientsWithMonthlyEarnings.slice(3);
    const otherClientsTotalBilled = otherClients.reduce((acc, client) => acc + client.total_billed, 0);

    return [
        ...topThreeClients,
        { id: "other", name: "Others", total_billed: otherClientsTotalBilled, count: otherClients.length }
    ];
}