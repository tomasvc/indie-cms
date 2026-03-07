import type { Invoice } from "@/types";
import { getFinancialSummary, invoiceTotal } from "@/lib/dashboard/financials";

/** Invoice shape returned by dashboard API (amount/number) vs app type (total/code). */
type DashboardInvoice = {
    id: string;
    project_id: string;
    client_id: string;
    status?: string;
    due_date?: string;
    paid_date?: string | null;
    issue_date?: string;
    amount?: number;
    total?: number;
};

type PortfolioItem = { view_count?: number };

export type TopStatsData = {
    monthlyEarnings: number;
    previousMonthEarnings: number;
    profit: number;
    unbilled: number;
    forecast30d: number;
    forecastCount: number;
    invoicesSent: number;
    totalInvoices: number;
    portfolioViews: number;
};

const today = new Date();
const in30Days = new Date(today);
in30Days.setDate(in30Days.getDate() + 30);

function getUnbilled(
    projects: Array<{ id: string; value?: number | null }>,
    invoices: DashboardInvoice[]
): number {
    const invoicedByProjectId = invoices.reduce<Record<string, number>>((acc, inv) => {
        const id = inv.project_id;
        acc[id] = (acc[id] ?? 0) + invoiceTotal(inv as Invoice);
        return acc;
    }, {});

    return projects.reduce((sum, proj) => {
        const value =
            typeof proj.value === "number" && !Number.isNaN(proj.value) ? proj.value : 0;
        const invoiced = invoicedByProjectId[proj.id] ?? 0;
        return sum + Math.max(0, value - invoiced);
    }, 0);
}

function getForecast30d(invoices: DashboardInvoice[]): number {
    return invoices
        .filter((inv) => {
            if (inv.paid_date != null) return false;
            const due = inv.due_date ? new Date(inv.due_date) : null;
            return due != null && due >= today && due <= in30Days;
        })
        .reduce((acc, inv) => acc + invoiceTotal(inv as Invoice), 0);
}

function getForecastCount(invoices: DashboardInvoice[]): number {
    return invoices.filter((inv) => {
        if (inv.paid_date || !inv.due_date) return false;
        const due = new Date(inv.due_date);
        return due >= today && due <= in30Days;
    }).length;
}

export function getTopStatsData(
    projects: Array<{ id: string; value?: number | null }>,
    invoices: DashboardInvoice[],
    portfolio: PortfolioItem[] | null
): TopStatsData {
    const summary = getFinancialSummary(invoices as unknown as Invoice[]);

    const unbilled = getUnbilled(projects, invoices);
    const forecast30d = getForecast30d(invoices);
    const forecastCount = getForecastCount(invoices);
    const invoicesSent = invoices.filter((inv) => inv.status === "sent").length;
    const portfolioViews = (portfolio ?? []).reduce(
        (acc, p) => acc + (typeof p.view_count === "number" ? p.view_count : 0),
        0
    );

    return {
        monthlyEarnings: summary.monthlyEarnings,
        previousMonthEarnings: summary.previousMonthEarnings,
        profit: summary.profit,
        unbilled,
        forecast30d,
        forecastCount,
        invoicesSent,
        totalInvoices: invoices.length,
        portfolioViews,
    };
}
