import type { DashboardCoreData } from "@/lib/data/dashboard";
import { Banknote, CalendarClock, FileClock, Hourglass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getTopStatsData } from "@/lib/dashboard/top-stats";
import { comparableChange, formatMoney, moneyEntries, type MoneyByCurrency } from "@/lib/money";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";

type TopStatsProps = {
    data: DashboardCoreData;
    profile: Profile;
};

export function TopStats({ data, profile }: TopStatsProps) {
    const projects = data.projects ?? [];
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
    // One line per currency, largest first: mixed currencies are never added together
    const money = (totals: MoneyByCurrency) => (
        <>
            {moneyEntries(totals, profile.currency).map(([currency, amount], index) => (
                <span key={currency} className={cn("block", index > 0 && "text-[16px] text-muted-foreground")}>
                    {formatMoney(amount, currency, locale, { whole: true })}
                </span>
            ))}
        </>
    );

    const revenueChange = Object.values(stats.previousMonthEarnings).some((amount) => amount > 0)
        ? comparableChange(stats.monthlyEarnings, stats.previousMonthEarnings)
        : null;

    const sections = [
        {
            id: "revenue",
            name: "Revenue (MTD)",
            icon: Banknote,
            value: money(stats.monthlyEarnings),
            subvalue: revenueChange ?? "",
            subValueText: revenueChange ? "vs last month" : "paid this month",
        },
        {
            id: "left-to-invoice",
            name: "Left to invoice",
            icon: Hourglass,
            value: money(stats.unbilled),
            subvalue: "",
            subValueText: "agreed fees not yet invoiced",
        },
        {
            id: "forecast",
            name: "Due in 30 days",
            icon: CalendarClock,
            value: money(stats.forecast30d),
            subvalue: stats.forecastCount,
            subValueText: stats.forecastCount === 1 ? "unpaid invoice" : "unpaid invoices",
        },
        {
            id: "invoices",
            name: "Awaiting payment",
            icon: FileClock,
            value: stats.invoicesSent,
            subvalue: "",
            subValueText: stats.invoicesSent === 1 ? "sent invoice not yet paid" : "sent invoices not yet paid",
        },
    ];

    return (
        <Card className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-lg p-0">
            {sections.map((s, i) => {
                const Icon = s.icon;

                return <div
                    key={s.id}
                    className={cn(
                        "p-4 flex flex-col gap-1 min-w-0",
                        i % 2 === 1 && "border-l",
                        i < 2 && "border-b lg:border-b-0",
                        i === 2 && "lg:border-l"
                    )}
                >
                    <div className="flex justify-between items-center gap-2">
                        <Typography variant="kpiLabel" as="p">{s.name}</Typography>
                        <Icon className="text-muted-foreground w-4 h-4 shrink-0" aria-hidden />
                    </div>
                    <div>
                        <Typography variant="kpiValue" as="div" className="tabular-nums break-words">{s.value}</Typography>
                        <Typography variant="kpiSub" as="p">{s.subvalue} {s.subValueText}</Typography>
                    </div>
                </div>
            })}
        </Card>
    )
}
