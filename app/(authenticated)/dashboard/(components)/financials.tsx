"use client";

import { useId, useState } from "react";
import type { DashboardCoreData } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { CircleAlertIcon, ClockIcon, UsersIcon, ChevronDownIcon, PercentIcon, InfoIcon, ChartPieIcon } from "lucide-react";
import { getFinancialSummary, getRepeatBusinessData, getClientRevenueBreakdown } from "@/lib/dashboard/financials";
import type { Invoice } from "@/types";
import { type ChartConfig } from "@/components/ui/chart";
import dynamic from "next/dynamic";
import { formatMoneyByCurrency } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Profile } from "@/types";

const FinancialsChart = dynamic(
    () => import("./financials-chart").then((m) => m.FinancialsChart),
    { ssr: false }
);

const ClientsRevenueChart = dynamic(
    () => import("./clients-revenue-chart").then((m) => m.ClientsRevenueChart),
    { ssr: false }
);

type FinancialsProps = {
    data: DashboardCoreData;
    profile: Profile;
};

export function Financials({ data, profile }: FinancialsProps) {
    const [repeatChartExpanded, setRepeatChartExpanded] = useState(false);
    const [clientsRevenueExpanded, setClientsRevenueExpanded] = useState(true);
    const repeatPanelId = useId();
    const clientsPanelId = useId();
    const [clientsRevenueAnimKey, setClientsRevenueAnimKey] = useState(0);

    const financialSummary = getFinancialSummary(data.invoices as unknown as Invoice[]);
    const { outstanding, unpaidCount, avgDaysToPay } = financialSummary;
    const locale = profile.language || "en";
    const money = (totals: Parameters<typeof formatMoneyByCurrency>[0]) =>
        formatMoneyByCurrency(totals, locale, profile.currency);

    const { chartData: repeatChartData, currency: repeatCurrency, otherCurrencies: repeatOthers } = getRepeatBusinessData(
        data.clients,
        data.invoices as unknown as Invoice[]
    );

    const { pieData: revenuePieData, warnings: revenueWarnings, currency: revenueCurrency, otherCurrencies: revenueOthers } = getClientRevenueBreakdown(
        data.clients,
        data.invoices as unknown as Invoice[]
    );
    const otherRevenue = formatMoneyByCurrency(revenueOthers, locale, profile.currency);
    const otherRepeat = formatMoneyByCurrency(repeatOthers, locale, profile.currency);

    const chartConfig = {
        value: {
            color: "var(--color-primary)",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="h2">Insights</Typography></CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="pb-2 divide-y border-b">
                    <div className="flex gap-3 pb-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <CircleAlertIcon className="w-3 h-3" aria-hidden />
                        </div>
                        <div>
                            <Typography variant="overline" as="p">Owed to you</Typography>
                            <Typography variant="metricValue" as="p" className="tabular-nums">{money(outstanding)}</Typography>
                            <Typography variant="kpiSub" as="p">{unpaidCount} unpaid {unpaidCount === 1 ? "invoice" : "invoices"}</Typography>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <ClockIcon className="w-3 h-3" aria-hidden />
                        </div>
                        <div>
                            <Typography variant="overline" as="p">Avg Days to Pay</Typography>
                            <Typography variant="metricValue" as="p" className="tabular-nums">
                                {avgDaysToPay != null ? `${avgDaysToPay.toFixed(1)} days` : "—"}
                            </Typography>
                        </div>
                    </div>
                </div>
                <div className="border-b">
                    <div className="flex justify-between pt-1 pb-2">
                        <div className="flex gap-2">
                            <PercentIcon className="w-3 h-3 text-muted-foreground mt-0.5" aria-hidden />
                            <div className="flex flex-col">
                                <Typography variant="cardSectionTitle" as="h3" className="flex items-center gap-1.5">
                                    Repeat Business Rate
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <InfoButton label="About repeat business rate" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-56">
                                            The share of paid revenue, in {repeatCurrency ?? "one currency"}, from active clients with more than one paid invoice.
                                        </TooltipContent>
                                    </Tooltip>
                                </Typography>
                                <Typography variant="body" color="muted" as="p" className="text-[13px]">
                                    {repeatCurrency ? `All-time paid invoices in ${repeatCurrency}` : "All-time paid invoices"}
                                    {Object.values(repeatOthers).some((amount) => amount > 0) ? `. Also paid: ${otherRepeat}` : ""}
                                </Typography>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRepeatChartExpanded((e) => !e)}
                            aria-expanded={repeatChartExpanded}
                            aria-controls={repeatPanelId}
                            aria-label={repeatChartExpanded ? "Hide repeat business chart" : "Show repeat business chart"}
                        >
                            <ChevronDownIcon
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${repeatChartExpanded ? "" : "-rotate-90"}`}
                            />
                        </Button>
                    </div>
                    <div
                        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                        style={{
                            gridTemplateRows: repeatChartExpanded ? "1fr" : "0fr",
                            opacity: repeatChartExpanded ? 1 : 0,
                        }}
                        id={repeatPanelId}
                        inert={!repeatChartExpanded}
                    >
                        <div className="min-h-0 overflow-hidden">
                            {repeatChartData.length > 1 && repeatChartData[0].value > 0 ? (
                                <>
                                    <FinancialsChart chartData={repeatChartData} chartConfig={chartConfig} />
                                    <Typography variant="bodySmall" color="muted" as="p" className="-mt-2 pb-2">
                                        Overall is the repeat share of all paid revenue. Each client bar is that client&apos;s share of repeat revenue.
                                    </Typography>
                                </>
                            ) : (
                                <div className="flex flex-col gap-1 items-center justify-center text-center h-full border rounded-lg px-4 py-6 mt-2 -mb-2 border-dashed">
                                    <ChartPieIcon className="w-4 h-4 text-muted-foreground mb-1" />
                                    <Typography variant="body" color="default" as="p" className="text-sm">No data available</Typography>
                                    <Typography variant="body" color="muted" as="p">This fills in once a client has paid you more than once.</Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between pt-1 pb-2">
                        <div className="flex gap-2">
                            <UsersIcon className="w-3 h-3 text-muted-foreground mt-0.5" aria-hidden />
                            <div className="flex flex-col">
                                <Typography variant="cardSectionTitle" as="h3" className="flex items-center gap-1.5">
                                    Revenue by Client
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <InfoButton label="About revenue by client" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-56">
                                            Paid revenue in {revenueCurrency ?? "one currency"}, split across clients. Other currencies are listed separately and are not added in.
                                        </TooltipContent>
                                    </Tooltip>
                                </Typography>
                                <Typography variant="body" color="muted" as="p" className="text-[13px]">
                                    {revenueCurrency ? `All-time paid invoices in ${revenueCurrency}` : "All-time paid invoices"}
                                    {Object.values(revenueOthers).some((amount) => amount > 0) ? `. Also paid: ${otherRevenue}` : ""}
                                </Typography>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setClientsRevenueExpanded((e) => {
                                if (!e) setClientsRevenueAnimKey((k) => k + 1);
                                return !e;
                            })}
                            aria-expanded={clientsRevenueExpanded}
                            aria-controls={clientsPanelId}
                            aria-label={clientsRevenueExpanded ? "Hide revenue by client" : "Show revenue by client"}
                        >
                            <ChevronDownIcon
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${clientsRevenueExpanded ? "" : "-rotate-90"}`}
                            />
                        </Button>
                    </div>
                    <div
                        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                        style={{
                            gridTemplateRows: clientsRevenueExpanded ? "1fr" : "0fr",
                            opacity: clientsRevenueExpanded ? 1 : 0,
                        }}
                        id={clientsPanelId}
                        inert={!clientsRevenueExpanded}
                    >
                        <div className="min-h-0 overflow-hidden px-2">
                            <ClientsRevenueChart
                                pieData={revenuePieData}
                                warnings={revenueWarnings}
                                animationKey={clientsRevenueAnimKey}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function InfoButton({ label, ...props }: { label: string } & React.ComponentProps<"button">) {
    return (
        <button
            type="button"
            aria-label={label}
            className="inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-2 relative"
            {...props}
        >
            <InfoIcon className="w-3 h-3 shrink-0" aria-hidden />
        </button>
    );
}