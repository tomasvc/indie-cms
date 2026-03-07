"use client";

import { useState } from "react";
import type { DashboardCoreData } from "@/lib/queries/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Typography } from "../../../../components/ui/typography";
import { DollarSignIcon, CircleAlertIcon, ClockIcon, UsersIcon, ChevronDownIcon, PercentIcon, InfoIcon } from "lucide-react";
import { getFinancialSummary, getRepeatBusinessData, getClientRevenueBreakdown } from "@/lib/dashboard/financials";
import type { Invoice } from "@/types";
import { type ChartConfig } from "@/components/ui/chart";
import dynamic from "next/dynamic";
import { formatMoney } from "@/lib/helpers/format";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
};

export function Financials({ data }: FinancialsProps) {
    const [repeatChartExpanded, setRepeatChartExpanded] = useState(true);
    const [clientsRevenueExpanded, setClientsRevenueExpanded] = useState(false);
    const [clientsRevenueAnimKey, setClientsRevenueAnimKey] = useState(0);

    const financialSummary = getFinancialSummary(data.invoices as unknown as Invoice[]);
    const { monthlyEarnings, previousMonthEarnings, outstanding, unpaidCount, avgDaysToPay } = financialSummary;

    const { chartData: repeatChartData } = getRepeatBusinessData(
        data.clients,
        data.invoices as unknown as Invoice[]
    );

    const { pieData: revenuePieData, totalClients, warnings: revenueWarnings } = getClientRevenueBreakdown(
        data.clients,
        data.invoices as unknown as Invoice[]
    );

    const chartConfig = {
        value: {
            color: "var(--color-primary)",
        },
    } satisfies ChartConfig;

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Financials</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your financial performance.</Typography></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="pb-2 divide-y border-b">
                    <div className="flex gap-3 pb-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <DollarSignIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <Typography variant="overline" as="p">This month earned</Typography>
                            <Typography variant="metricValue" as="p">{formatMoney(monthlyEarnings, "USD")}</Typography>
                            <Typography variant="kpiSub" as="p">
                                vs {previousMonthEarnings >= 1000
                                    ? `${formatMoney(previousMonthEarnings / 1000, "USD")}K`
                                    : formatMoney(previousMonthEarnings, "USD")
                                } last month
                            </Typography>
                        </div>
                    </div>
                    <div className="flex gap-3 py-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <CircleAlertIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <Typography variant="overline" as="p">Outstanding</Typography>
                            <Typography variant="metricValue" as="p">{formatMoney(outstanding, "USD")}</Typography>
                            <Typography variant="kpiSub" as="p">{unpaidCount} unpaid {unpaidCount === 1 ? "invoice" : "invoices"}</Typography>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <ClockIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <Typography variant="overline" as="p">Avg Days to Pay</Typography>
                            <Typography variant="metricValue" as="p">{avgDaysToPay?.toFixed(1) ?? "-"}</Typography>
                        </div>
                    </div>
                </div>
                <div className="border-b">
                    <div className="flex justify-between pt-1 pb-2">
                        <div className="flex gap-2">
                            <PercentIcon className="w-3 h-3 text-muted-foreground mt-0.5" />
                            <div className="flex flex-col">
                                <Typography variant="cardSectionTitle" as="span" className="flex items-center gap-1.5">
                                    Repeat Business Rate
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <InfoIcon className="w-3 h-3 text-muted-foreground cursor-default shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-56">
                                            The share of total revenue coming from active clients who have paid more than one invoice. A higher rate means stronger client retention.
                                        </TooltipContent>
                                    </Tooltip>
                                </Typography>
                                <Typography variant="body" color="muted" as="p" className="text-xs">
                                    Based on available invoices
                                </Typography>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRepeatChartExpanded((e) => !e)}
                        >
                            <ChevronDownIcon
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${repeatChartExpanded ? "" : "-rotate-90"}`}
                            />
                        </Button>
                    </div>
                    <div
                        className="transition-[height,opacity] duration-300 ease-in-out overflow-hidden"
                        style={{
                            height: repeatChartExpanded ? '180px' : '0px',
                            opacity: repeatChartExpanded ? 1 : 0,
                        }}
                        aria-hidden={!repeatChartExpanded}
                    >
                        <div>
                            <FinancialsChart chartData={repeatChartData} chartConfig={chartConfig} />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between pt-1 pb-2">
                        <div className="flex gap-2">
                            <UsersIcon className="w-3 h-3 text-muted-foreground mt-0.5" />
                            <div className="flex flex-col">
                                <Typography variant="cardSectionTitle" as="span" className="flex items-center gap-1.5">
                                    Clients Breakdown / Revenue
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <InfoIcon className="w-3 h-3 text-muted-foreground cursor-default shrink-0" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-56">
                                            All-time revenue split across your clients. Use this to spot unhealthy concentration — warnings appear automatically when a single client dominates your income.
                                        </TooltipContent>
                                    </Tooltip>
                                </Typography>
                                <Typography variant="body" color="muted" as="p" className="text-xs">
                                    See your biggest and smallest clients.
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
                        >
                            <ChevronDownIcon
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${clientsRevenueExpanded ? "" : "-rotate-90"}`}
                            />
                        </Button>
                    </div>
                    <div
                        className="transition-[height,opacity] duration-300 ease-in-out overflow-hidden"
                        style={{
                            height: clientsRevenueExpanded ? '200px' : '0px',
                            opacity: clientsRevenueExpanded ? 1 : 0,
                        }}
                        aria-hidden={!clientsRevenueExpanded}
                    >
                        <div className="pt-0 pb-0 -mx-[18px] sm:mx-2">
                            <ClientsRevenueChart
                                pieData={revenuePieData}
                                totalClients={totalClients}
                                warnings={revenueWarnings}
                                animationKey={clientsRevenueAnimKey}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}