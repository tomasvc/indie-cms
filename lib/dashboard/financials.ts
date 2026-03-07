import type { Client, Invoice } from "@/types";

// -----------------------------------------------------------------------------
// Invoice amount helpers (dashboard API uses amount; app type uses total/subtotal)
// -----------------------------------------------------------------------------

/** Dashboard API returns amount; app type uses total. Normalize for both. */
export function invoiceTotal(inv: Invoice | { total?: number; amount?: number }): number {
    const n = (inv as { amount?: number }).amount ?? (inv as Invoice).total;
    return typeof n === "number" && !Number.isNaN(n) ? n : 0;
}

function invoiceSubtotal(inv: Invoice | { subtotal?: number }): number {
    const n = (inv as Invoice).subtotal;
    return typeof n === "number" && !Number.isNaN(n) ? n : 0;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type FinancialSummary = {
    monthlyEarnings: number;
    previousMonthEarnings: number;
    outstanding: number;
    unpaidCount: number;
    avgDaysToPay: number | null;
    profit: number;
};

// -----------------------------------------------------------------------------
// Date boundaries (current and previous month)
// -----------------------------------------------------------------------------

const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

// -----------------------------------------------------------------------------
// Core financial summary
// -----------------------------------------------------------------------------

export function getFinancialSummary(invoices: Array<Invoice> | null): FinancialSummary {
    const list = invoices ?? [];

    const previousMonthInvoices = list.filter(invoice => {
        const paid = invoice.paid_date == null ? null : new Date(invoice.paid_date);
        return paid != null && paid >= startOfPreviousMonth && paid <= endOfPreviousMonth;
    });

    const previousMonthEarnings = previousMonthInvoices?.reduce(
        (acc, invoice) => acc + invoiceTotal(invoice),
        0
    ) ?? 0;
    const thisMonthInvoices = list.filter(invoice => {
        const paid = invoice.paid_date == null ? null : new Date(invoice.paid_date);
        return paid != null && paid >= startOfMonth && paid <= endOfMonth;
    });

    const profit = thisMonthInvoices?.reduce(
        (acc, invoice) => acc + (invoiceTotal(invoice) - invoiceSubtotal(invoice)),
        0
    ) ?? 0;

    const monthlyEarnings = thisMonthInvoices?.reduce(
        (acc, invoice) => acc + invoiceTotal(invoice),
        0
    ) ?? 0;

    const outstanding = list.filter(invoice => invoice.paid_date === null).reduce(
        (acc, invoice) => acc + invoiceTotal(invoice),
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

    return {
        monthlyEarnings,
        previousMonthEarnings,
        outstanding,
        unpaidCount: unpaidInvoices.length,
        avgDaysToPay,
        profit,
    };
}

// -----------------------------------------------------------------------------
// Client breakdown (for Financials card)
// -----------------------------------------------------------------------------

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
        acc[id] = (acc[id] ?? 0) + invoiceTotal(inv);
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

// -----------------------------------------------------------------------------
// Repeat business rate: % of revenue from active clients with multiple invoices
// -----------------------------------------------------------------------------

export type RepeatBusinessChartItem = {
    name: string;
    value: number;
    isOverall?: boolean;
};

export function getRepeatBusinessData(
    clients: Array<Client> | null,
    invoices: Array<Invoice> | null
): { overallPercent: number; chartData: RepeatBusinessChartItem[] } {
    const invList = invoices ?? [];
    const clientList = clients ?? [];

    const totalRevenue = invList.reduce((acc, inv) => acc + invoiceTotal(inv), 0);
    if (totalRevenue <= 0) {
        return { overallPercent: 0, chartData: [{ name: "Overall", value: 0, isOverall: true }] };
    }

    const activeClientIds = new Set(
        clientList
            .filter((c) => String((c as Client & { status?: string }).status ?? "").toLowerCase() === "active")
            .map((c) => c.id)
    );

    const revenueByClientId: Record<string, number> = {};
    const invoiceCountByClientId: Record<string, number> = {};
    for (const inv of invList) {
        const cid = inv.client_id;
        if (!cid) continue;
        revenueByClientId[cid] = (revenueByClientId[cid] ?? 0) + invoiceTotal(inv);
        invoiceCountByClientId[cid] = (invoiceCountByClientId[cid] ?? 0) + 1;
    }

    const repeatClientIds = [...activeClientIds].filter((id) => (invoiceCountByClientId[id] ?? 0) >= 2);
    const repeatRevenue = repeatClientIds.reduce((acc, id) => acc + (revenueByClientId[id] ?? 0), 0);
    const overallPercent = Math.round((repeatRevenue / totalRevenue) * 100);

    const clientIdToName: Record<string, string> = {};
    for (const c of clientList) {
        clientIdToName[c.id] = c.name;
    }

    const chartData: RepeatBusinessChartItem[] = [{ name: "Overall", value: overallPercent, isOverall: true }];

    // If no clients are "active", treat all clients as active so we still show repeat % by invoice count
    let clientIdsForRepeat = repeatClientIds;
    if (repeatClientIds.length === 0 && totalRevenue > 0) {
        const anyClientWithMultipleInvoices = Object.entries(invoiceCountByClientId).filter(([, count]) => count >= 2);
        if (anyClientWithMultipleInvoices.length > 0) {
            const repeatRevenueFallback = anyClientWithMultipleInvoices.reduce(
                (acc, [id]) => acc + (revenueByClientId[id] ?? 0),
                0
            );
            const overallFallback = Math.round((repeatRevenueFallback / totalRevenue) * 100);
            chartData[0] = { name: "Overall", value: overallFallback, isOverall: true };
            clientIdsForRepeat = anyClientWithMultipleInvoices.map(([id]) => id);
            const repeatRevenue = repeatRevenueFallback;
            const repeatClientsWithRevenue = clientIdsForRepeat
                .map((id) => ({
                    id,
                    name: clientIdToName[id] ?? "Unknown",
                    revenue: revenueByClientId[id] ?? 0,
                }))
                .filter((c) => c.revenue > 0)
                .sort((a, b) => b.revenue - a.revenue);
            const topRepeat = repeatClientsWithRevenue.slice(0, 4);
            const others = repeatClientsWithRevenue.slice(4);
            const othersRevenue = others.reduce((acc, c) => acc + c.revenue, 0);
            chartData.push(
                ...topRepeat.map((c) => ({
                    name: c.name,
                    value: Math.round((c.revenue / repeatRevenue) * 100),
                    isOverall: false as const,
                }))
            );
            if (others.length > 0) {
                chartData.push({
                    name: "Others",
                    value: Math.round((othersRevenue / repeatRevenue) * 100),
                    isOverall: false,
                });
            }
            return { overallPercent: overallFallback, chartData };
        }
    }

    if (repeatRevenue <= 0) {
        return { overallPercent, chartData };
    }

    const repeatClientsWithRevenue = clientIdsForRepeat
        .map((id) => ({
            id,
            name: clientIdToName[id] ?? "Unknown",
            revenue: revenueByClientId[id] ?? 0,
        }))
        .filter((c) => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

    const topRepeat = repeatClientsWithRevenue.slice(0, 4);
    const others = repeatClientsWithRevenue.slice(4);
    const othersRevenue = others.reduce((acc, c) => acc + c.revenue, 0);

    chartData.push(
        ...topRepeat.map((c) => ({
            name: c.name,
            value: Math.round((c.revenue / repeatRevenue) * 100),
            isOverall: false as const,
        }))
    );
    if (others.length > 0) {
        chartData.push({
            name: "Others",
            value: Math.round((othersRevenue / repeatRevenue) * 100),
            isOverall: false,
        });
    }

    return { overallPercent, chartData };
}

// -----------------------------------------------------------------------------
// Clients breakdown by revenue (all-time) for half-pie chart + overdependence warnings
// -----------------------------------------------------------------------------

export type ClientRevenueSegment = {
    name: string;
    value: number;
    percent: number;
};

export type RevenueWarning =
    | { type: "overdependence"; clientName: string; percent: number }
    | { type: "single_client"; clientName: string }
    | { type: "top2_concentration"; client1: string; client2: string; percent: number }
    | { type: "dormant_top_client"; clientName: string; status: "lead" | "archived" }
    | { type: "overdue_concentration"; clientName: string; percent: number; amount: number };

export function getClientRevenueBreakdown(
    clients: Array<Client> | null,
    invoices: Array<Invoice> | null
): {
    pieData: ClientRevenueSegment[];
    totalClients: number;
    totalRevenue: number;
    warnings: RevenueWarning[];
} {
    const invList = invoices ?? [];
    const clientList = clients ?? [];

    const totalRevenue = invList.reduce((acc, inv) => acc + invoiceTotal(inv), 0);
    const revenueByClientId: Record<string, number> = {};
    for (const inv of invList) {
        const cid = inv.client_id;
        if (!cid) continue;
        revenueByClientId[cid] = (revenueByClientId[cid] ?? 0) + invoiceTotal(inv);
    }

    const clientIdToName: Record<string, string> = {};
    for (const c of clientList) {
        clientIdToName[c.id] = c.name;
    }

    const clientsWithRevenue = (clientList ?? [])
        .map((c) => ({
            id: c.id,
            name: c.name,
            revenue: revenueByClientId[c.id] ?? 0,
        }))
        .filter((c) => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

    const warnings: RevenueWarning[] = [];
    const pieData: ClientRevenueSegment[] = [];

    if (totalRevenue <= 0) {
        return {
            pieData: [],
            totalClients: clientList.length,
            totalRevenue: 0,
            warnings: [],
        };
    }

    for (const c of clientsWithRevenue) {
        const percent = (c.revenue / totalRevenue) * 100;
        pieData.push({ name: c.name.toUpperCase(), value: c.revenue, percent: Math.round(percent) });
        if (percent > 50) {
            warnings.push({ type: "overdependence", clientName: c.name, percent: Math.round(percent) });
        }
    }

    // Single client: only one revenue source
    if (clientsWithRevenue.length === 1) {
        warnings.push({ type: "single_client", clientName: clientsWithRevenue[0].name });
    }

    // Top-2 concentration: together >75% but neither alone triggers overdependence
    if (clientsWithRevenue.length >= 2) {
        const top1Pct = (clientsWithRevenue[0].revenue / totalRevenue) * 100;
        const top2Pct = ((clientsWithRevenue[0].revenue + clientsWithRevenue[1].revenue) / totalRevenue) * 100;
        if (top1Pct <= 50 && top2Pct > 75) {
            warnings.push({
                type: "top2_concentration",
                client1: clientsWithRevenue[0].name,
                client2: clientsWithRevenue[1].name,
                percent: Math.round(top2Pct),
            });
        }
    }

    // Dormant top client: highest earner is not an active client
    if (clientsWithRevenue.length > 0) {
        const topClient = clientList.find((c) => c.id === clientsWithRevenue[0].id);
        if (topClient && topClient.status !== "active") {
            warnings.push({
                type: "dormant_top_client",
                clientName: topClient.name,
                status: topClient.status as "lead" | "archived",
            });
        }
    }

    // Overdue concentration: one client holds >60% of all unpaid invoice value
    const unpaidInvoices = invList.filter((inv) => inv.paid_date == null && inv.status !== "void");
    const totalOutstanding = unpaidInvoices.reduce((acc, inv) => acc + invoiceTotal(inv), 0);
    if (totalOutstanding > 0) {
        const outstandingByClient: Record<string, number> = {};
        for (const inv of unpaidInvoices) {
            if (!inv.client_id) continue;
            outstandingByClient[inv.client_id] = (outstandingByClient[inv.client_id] ?? 0) + invoiceTotal(inv);
        }
        const [topClientId, topAmount] = Object.entries(outstandingByClient).sort((a, b) => b[1] - a[1])[0] ?? [];
        if (topClientId) {
            const pct = (topAmount / totalOutstanding) * 100;
            if (pct > 60) {
                warnings.push({
                    type: "overdue_concentration",
                    clientName: clientIdToName[topClientId] ?? "Unknown",
                    percent: Math.round(pct),
                    amount: topAmount,
                });
            }
        }
    }

    return {
        pieData,
        totalClients: clientList.length,
        totalRevenue,
        warnings,
    };
}