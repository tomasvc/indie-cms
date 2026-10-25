import type { Invoice } from "@/types";
import { getFinancialSummary } from "@/lib/dashboard/financials";
import { invoiceTotal, isBilled, isOutstanding } from "@/lib/helpers/invoices";

type DashboardInvoice = Pick<Invoice, "id" | "project_id" | "client_id" | "status" | "due_date" | "paid_date" | "issue_date" | "total">;

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
    const invoicedByProjectId = invoices.filter(isBilled).reduce<Record<string, number>>((acc, inv) => {
        const id = inv.project_id;
        acc[id] = (acc[id] ?? 0) + invoiceTotal(inv);
        return acc;
    }, {});

    return projects.reduce((sum, proj) => {
        const value =
            typeof proj.value === "number" && !Number.isNaN(proj.value) ? proj.value : 0;
        const invoiced = invoicedByProjectId[proj.id] ?? 0;
        return sum + Math.max(0, value - invoiced);
    }, 0);
}

function getForecastInvoices(invoices: DashboardInvoice[]): DashboardInvoice[] {
    return invoices.filter((inv) => {
        if (!isOutstanding(inv) || !inv.due_date) return false;
        const due = new Date(inv.due_date);
        return due >= today && due <= in30Days;
    });
}

export function getTopStatsData(
    projects: Array<{ id: string; value?: number | null }>,
    invoices: DashboardInvoice[],
    portfolio: PortfolioItem[] | null
): TopStatsData {
    const summary = getFinancialSummary(invoices as Invoice[]);

    const unbilled = getUnbilled(projects, invoices);
    const forecastInvoices = getForecastInvoices(invoices);
    const invoicesSent = invoices.filter(isOutstanding).length;
    const portfolioViews = (portfolio ?? []).reduce(
        (acc, p) => acc + (typeof p.view_count === "number" ? p.view_count : 0),
        0
    );

    return {
        monthlyEarnings: summary.monthlyEarnings,
        previousMonthEarnings: summary.previousMonthEarnings,
        profit: summary.profit,
        unbilled,
        forecast30d: forecastInvoices.reduce((acc, inv) => acc + invoiceTotal(inv), 0),
        forecastCount: forecastInvoices.length,
        invoicesSent,
        totalInvoices: invoices.length,
        portfolioViews,
    };
}
