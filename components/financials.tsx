import type { DashboardCoreData } from "@/lib/queries/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { DollarSignIcon, CircleAlertIcon, ClockIcon, UsersIcon } from "lucide-react";
import { getClientFinancialBreakdown, getFinancialSummary } from "@/lib/dashboard/financials";

type FinancialsProps = {
    data: DashboardCoreData;
};

export function Financials({ data }: FinancialsProps) {

    const financialSummary = getFinancialSummary(data.invoices);
    const { monthlyEarnings, previousMonthEarnings, outstanding, unpaidCount, avgDaysToPay } = financialSummary;

    const clientFinancialBreakdown = getClientFinancialBreakdown(
        data.clients,
        data.invoices
    );

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>Financials</CardTitle>
                <CardDescription>This is a summary of your financial performance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 divide-y">
                <div className="pb-2 divide-y">
                    <div className="flex gap-3 pb-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <DollarSignIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">This month earned</p>
                            <p className="text-lg font-bold">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyEarnings)}</p>
                            <p className="text-xs text-muted-foreground">vs {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(previousMonthEarnings)} last month</p>
                        </div>
                    </div>
                    <div className="flex gap-3 py-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <CircleAlertIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className="text-lg font-bold">{Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(outstanding)}</p>
                            <p className="text-xs text-muted-foreground">{unpaidCount} unpaid {unpaidCount === 1 ? "invoice" : "invoices"}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-3">
                        <div className="flex items-center justify-center w-7 h-7 bg-muted rounded-lg">
                            <ClockIcon className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg Days to Pay</p>
                            <p className="text-lg font-bold">{avgDaysToPay ?? "-"}</p>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center gap-2 pb-2">
                        <UsersIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                            Clients Breakdown
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {clientFinancialBreakdown.map((client) =>
                            client.total_billed > 0 ? (
                                <div className="flex flex-col gap-1 pb-2" key={client.id}>
                                    <div className="flex justify-between">
                                        <p>
                                            {client.name}
                                            {client.id === "other" && client.count != null
                                                ? ` (${client.count})`
                                                : ""}
                                        </p>
                                        <p className="font-medium">
                                            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(client.total_billed)}
                                        </p>
                                    </div>
                                    <Progress
                                        value={
                                            (client.total_billed /
                                                clientFinancialBreakdown.reduce((sum, c) => sum + (c.total_billed || 0), 0)) *
                                            100
                                        }
                                    />
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}