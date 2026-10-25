import type { Invoice } from "@/types";
import { getFinancialSummary } from "@/lib/dashboard/financials";
import { invoiceTotal, isBilled, isOutstanding } from "@/lib/helpers/invoices";
import { addDaysISO, currencyOf, isOnOrBetween, sumByCurrency, todayISO, type MoneyByCurrency } from "@/lib/money";

type DashboardProject = { id: string; value?: number | null; status?: string | null; currency?: string | null };
type DashboardInvoice = Pick<Invoice, "id" | "project_id" | "client_id" | "status" | "due_date" | "paid_date" | "issue_date" | "total" | "currency">;
type PortfolioItem = { view_count?: number };

const ACTIVE = new Set(["active", "review"]);

export type TopStatsData = {
    monthlyEarnings: MoneyByCurrency;
    previousMonthEarnings: MoneyByCurrency;
    unbilled: MoneyByCurrency;
    forecast30d: MoneyByCurrency;
    forecastCount: number;
    invoicesSent: number;
    totalInvoices: number;
    portfolioViews: number;
};

function getUnbilled(projects: DashboardProject[], invoices: DashboardInvoice[]): MoneyByCurrency {
    const invoicedByProject = invoices.filter(isBilled).reduce<Record<string, MoneyByCurrency>>((acc, invoice) => {
        const currency = currencyOf(invoice);
        const bucket = acc[invoice.project_id] ?? {};
        bucket[currency] = (bucket[currency] ?? 0) + invoiceTotal(invoice);
        acc[invoice.project_id] = bucket;
        return acc;
    }, {});

    return sumByCurrency(
        projects.filter((project) => ACTIVE.has(project.status ?? "")),
        (project) => {
            const value = typeof project.value === "number" && !Number.isNaN(project.value) ? project.value : 0;
            const invoiced = invoicedByProject[project.id]?.[currencyOf(project)] ?? 0;
            return Math.max(0, value - invoiced);
        },
        currencyOf
    );
}

export function getTopStatsData(
    projects: DashboardProject[],
    invoices: DashboardInvoice[],
    portfolio: PortfolioItem[] | null,
    today = todayISO()
): TopStatsData {
    const summary = getFinancialSummary(invoices as Invoice[], today);
    const horizon = addDaysISO(today, 30);
    const forecastInvoices = invoices.filter(
        (invoice) => isOutstanding(invoice) && isOnOrBetween(invoice.due_date, today, horizon)
    );

    return {
        monthlyEarnings: summary.monthlyEarnings,
        previousMonthEarnings: summary.previousMonthEarnings,
        unbilled: getUnbilled(projects, invoices),
        forecast30d: sumByCurrency(forecastInvoices, (invoice) => invoiceTotal(invoice), currencyOf),
        forecastCount: forecastInvoices.length,
        invoicesSent: invoices.filter(isOutstanding).length,
        totalInvoices: invoices.length,
        portfolioViews: (portfolio ?? []).reduce(
            (acc, item) => acc + (typeof item.view_count === "number" ? item.view_count : 0),
            0
        ),
    };
}
