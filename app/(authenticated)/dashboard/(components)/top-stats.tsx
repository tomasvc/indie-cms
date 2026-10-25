import type { DashboardCoreData } from "@/lib/data/dashboard";
import { DollarSign, FileCheck } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Typography } from "../../../../components/ui/typography";
import { getTopStatsData } from "@/lib/dashboard/top-stats";
import { comparableChange, formatMoneyByCurrency } from "@/lib/money";
import { Profile } from "@/types";

type TopStatsProps = {
    data: DashboardCoreData;
    profile: Profile;
};

export function TopStats({ data, profile }: TopStatsProps) {
    const projects = data.projects;
    if (!projects || projects.length === 0) {
        return <Typography variant="body" color="muted">No projects found</Typography>;
    }

    const locale = profile.language || "en";
    const stats = getTopStatsData(
        projects.map((project) => ({
            id: project.id,
            value: project.value,
            status: project.status,
            currency: project.currency,
        })),
        data.invoices,
        data.portfolio
    );
    const money = (totals: Parameters<typeof formatMoneyByCurrency>[0]) =>
        formatMoneyByCurrency(totals, locale, profile.currency);
    const revenueChange = comparableChange(stats.monthlyEarnings, stats.previousMonthEarnings);

    const sections = [
        {
            id: "revenue",
            name: "Revenue (MTD)",
            icon: DollarSign,
            value: money(stats.monthlyEarnings),
            subvalue: revenueChange ?? "",
            subValueText: revenueChange ? "vs last month" : "paid this month",
        },
        {
            id: "unbilled",
            name: "Unbilled",
            icon: DollarSign,
            value: money(stats.unbilled),
            subvalue: "",
            subValueText: "active and in review",
        },
        {
            id: "forecast",
            name: "30d Forecast",
            icon: DollarSign,
            value: money(stats.forecast30d),
            subvalue: stats.forecastCount,
            subValueText: stats.forecastCount === 1 ? "invoice due" : "invoices due",
        },
        {
            id: "invoices",
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
        <Card className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-lg divide-x p-0">
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