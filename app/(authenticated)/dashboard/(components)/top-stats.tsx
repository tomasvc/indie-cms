import type { DashboardCoreData } from "@/lib/queries/dashboard";
import { DollarSign, Eye, FileCheck } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Typography } from "../../../../components/ui/typography";
import { getTopStatsData } from "@/lib/dashboard/top-stats";

function formatCurrency(value: number): string {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatPercentChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? "+∞" : "0%";
    const pct = ((current - previous) / previous) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(0)}%`;
}

type TopStatsProps = {
    data: DashboardCoreData;
};

export function TopStats({ data }: TopStatsProps) {
    const projects = data.projects;
    if (!projects || projects.length === 0) {
        return <Typography variant="body" color="muted">No projects found</Typography>;
    }

    const stats = getTopStatsData(
        projects.map((p) => ({ id: p.id, value: p.value })),
        data.invoices,
        data.portfolio
    );

    const revenueMTD = formatCurrency(stats.monthlyEarnings);
    const revenueChange = formatPercentChange(stats.monthlyEarnings, stats.previousMonthEarnings);
    const profitFormatted = formatCurrency(stats.profit);
    const profitChange =
        stats.previousMonthEarnings > 0
            ? formatPercentChange(stats.profit, stats.previousMonthEarnings)
            : "0%";

    const sections = [
        {
            id: crypto.randomUUID(),
            name: "Revenue (MTD)",
            icon: DollarSign,
            value: revenueMTD,
            subvalue: revenueChange,
            subValueText: "vs last month",
        },
        {
            id: crypto.randomUUID(),
            name: "Profit",
            icon: DollarSign,
            value: profitFormatted,
            subvalue: profitChange,
            subValueText: "vs last month",
        },
        {
            id: crypto.randomUUID(),
            name: "Unbilled",
            icon: DollarSign,
            value: formatCurrency(stats.unbilled),
            subvalue: "0%",
            subValueText: "unbilled",
        },
        {
            id: crypto.randomUUID(),
            name: "30d Forecast",
            icon: DollarSign,
            value: formatCurrency(stats.forecast30d),
            subvalue: stats.forecastCount,
            subValueText: "vs last month",
        },
        {
            id: crypto.randomUUID(),
            name: "Invoices Sent",
            icon: FileCheck,
            value: stats.invoicesSent,
            subvalue: stats.totalInvoices,
            subValueText: "total invoices",
        },
        // {
        //     id: crypto.randomUUID(),
        //     name: "Portfolio Views",
        //     icon: Eye,
        //     value: stats.portfolioViews,
        //     subvalue: 0,
        //     subValueText: "portfolio views",
        // },
    ];

    return (
        <Card className="grid grid-cols-5 gap-0 rounded-lg divide-x p-0">
            {sections.map((s) => {
                const Icon = s.icon;

                return <div key={s.id} className="p-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <Typography variant="kpiLabel" as="p">{s.name}</Typography>
                        <Icon className="text-muted-foreground w-4 h-4" />
                    </div>
                    <div>
                        <Typography variant="kpiValue" as="p">{s.value}</Typography>
                        <Typography variant="kpiSub" as="p">{s.subvalue} {s.subValueText}</Typography>
                    </div>
                </div>
            })}
        </Card>
    )
}