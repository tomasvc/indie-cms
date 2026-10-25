import type { Client, Invoice } from "@/types";
import { invoiceTotal, isOutstanding, isRevenue } from "@/lib/helpers/invoices";
import {
    currencyOf,
    daysBetween,
    dominantCurrency,
    exceptCurrency,
    isOnOrBetween,
    monthRange,
    sumByCurrency,
    todayISO,
    type MoneyByCurrency,
} from "@/lib/money";

export { invoiceTotal };
export type { MoneyByCurrency };

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type FinancialSummary = {
    monthlyEarnings: MoneyByCurrency;
    previousMonthEarnings: MoneyByCurrency;
    outstanding: MoneyByCurrency;
    unpaidCount: number;
    avgDaysToPay: number | null;
};

const amountOf = (invoice: Invoice) => invoiceTotal(invoice);

export function getFinancialSummary(invoices: Array<Invoice> | null, today = todayISO()): FinancialSummary {
    const list = invoices ?? [];
    const { start, end, previousStart, previousEnd } = monthRange(today);
    const paid = list.filter(isRevenue);

    const previousMonthInvoices = paid.filter((invoice) =>
        isOnOrBetween(invoice.paid_date, previousStart, previousEnd)
    );
    const thisMonthInvoices = paid.filter((invoice) => isOnOrBetween(invoice.paid_date, start, end));
    const outstandingInvoices = list.filter(isOutstanding);
    const paidWithIssueDate = paid.filter((invoice) => invoice.paid_date && invoice.issue_date);

    const totalDays = paidWithIssueDate.reduce(
        (acc, invoice) => acc + daysBetween(invoice.paid_date!, invoice.issue_date!),
        0
    );

    return {
        monthlyEarnings: sumByCurrency(thisMonthInvoices, amountOf, currencyOf),
        previousMonthEarnings: sumByCurrency(previousMonthInvoices, amountOf, currencyOf),
        outstanding: sumByCurrency(outstandingInvoices, amountOf, currencyOf),
        unpaidCount: outstandingInvoices.length,
        avgDaysToPay: paidWithIssueDate.length > 0 ? totalDays / paidWithIssueDate.length : null,
    };
}

// -----------------------------------------------------------------------------
// Client breakdown (for Financials card)
// -----------------------------------------------------------------------------

export function getClientFinancialBreakdown(
    clients: Array<Client> | null,
    invoices: Array<Invoice> | null,
    today = todayISO()
): Array<{ id: string; name: string; totals: MoneyByCurrency; count?: number }> {
    const { start, end } = monthRange(today);
    const thisMonthInvoices = (invoices ?? []).filter(
        (inv) => isRevenue(inv) && isOnOrBetween(inv.paid_date, start, end)
    );
    const thisMonthEarningsByClientId = thisMonthInvoices.reduce<Record<string, MoneyByCurrency>>((acc, inv) => {
        const id = inv.client_id;
        const currency = currencyOf(inv);
        const bucket = acc[id] ?? {};
        bucket[currency] = (bucket[currency] ?? 0) + invoiceTotal(inv);
        acc[id] = bucket;
        return acc;
    }, {});

    const totalOf = (totals: MoneyByCurrency) => Object.values(totals).reduce((sum, amount) => sum + amount, 0);

    return (clients ?? [])
        .map((client) => ({ id: client.id, name: client.name, totals: thisMonthEarningsByClientId[client.id] ?? {} }))
        .filter((client) => totalOf(client.totals) > 0)
        .sort((a, b) => totalOf(b.totals) - totalOf(a.totals));
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
): { overallPercent: number; chartData: RepeatBusinessChartItem[]; currency: string | null; otherCurrencies: MoneyByCurrency } {
    const paid = (invoices ?? []).filter(isRevenue);
    const paidTotals = sumByCurrency(paid, amountOf, currencyOf);
    const currency = dominantCurrency(paidTotals);
    const otherCurrencies = exceptCurrency(paidTotals, currency);
    const invList = currency ? paid.filter((invoice) => currencyOf(invoice) === currency) : [];
    const clientList = clients ?? [];
    const pack = (overallPercent: number, chartData: RepeatBusinessChartItem[]) => ({
        overallPercent,
        chartData,
        currency,
        otherCurrencies,
    });

    const totalRevenue = invList.reduce((acc, inv) => acc + invoiceTotal(inv), 0);
    if (totalRevenue <= 0) {
        return pack(0, [{ name: "Overall", value: 0, isOverall: true }]);
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
            return pack(overallFallback, chartData);
        }
    }

    if (repeatRevenue <= 0) {
        return pack(overallPercent, chartData);
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

    return pack(overallPercent, chartData);
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
    currency: string | null;
    otherCurrencies: MoneyByCurrency;
    warnings: RevenueWarning[];
} {
    const all = invoices ?? [];
    const paid = all.filter(isRevenue);
    const paidTotals = sumByCurrency(paid, amountOf, currencyOf);
    const currency = dominantCurrency(paidTotals);
    const otherCurrencies = exceptCurrency(paidTotals, currency);
    const invList = currency ? paid.filter((invoice) => currencyOf(invoice) === currency) : [];
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

    if (totalRevenue > 0) {
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
    }

    // Outstanding concentration, in the same currency as the revenue chart.
    const outstandingCurrency = currency ?? dominantCurrency(sumByCurrency(all.filter(isOutstanding), amountOf, currencyOf));
    const unpaidInvoices = outstandingCurrency
        ? all.filter((invoice) => isOutstanding(invoice) && currencyOf(invoice) === outstandingCurrency)
        : [];
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
        currency,
        otherCurrencies,
        warnings,
    };
}