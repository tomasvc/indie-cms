import Link from "next/link";
import { AlertTriangleIcon, CircleCheckIcon, ClockIcon, FileWarningIcon, ListTodoIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { DashboardCoreData } from "@/lib/data/dashboard";
import { getClientRevenueBreakdown } from "@/lib/dashboard/financials";
import { getOverdueTasks } from "@/lib/dashboard/workload";
import { clientLabel } from "@/lib/helpers/clients";
import { formatMoney } from "@/lib/helpers/format";
import { isOverdue } from "@/lib/helpers/invoices";
import { daysBetween, todayISO } from "@/lib/money";
import type { Invoice, Task } from "@/types";
import { RecordPaymentButton } from "../../invoices/(components)/record-payment-button";
import { FlagSolidIcon } from "./icons";
import { RevenueWarningText } from "./revenue-warning-text";
import { AttentionList } from "./attention-list";

type NeedsAttentionProps = {
    data: DashboardCoreData;
    locale: string;
};

const daysOverdue = (dueDate: string, today: string) => {
    const days = Math.abs(daysBetween(dueDate, today));
    return days === 1 ? "1 day overdue" : `${days} days overdue`;
};

/** The first thing on the dashboard: what to act on today, each with its next step. */
export function NeedsAttention({ data, locale }: NeedsAttentionProps) {
    const today = todayISO();
    const invoices = data.invoices as unknown as Invoice[];
    const clientById = new Map(data.clients.map((client) => [client.id, client]));
    const projectTitle = new Map(data.projects.map((project) => [project.id, project.title]));

    const overdueInvoices = invoices
        .filter((invoice) => isOverdue(invoice, today))
        .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
    const overdueTasks = getOverdueTasks(data.tasks as unknown as Task[], today)
        .sort((a, b) => a.due_date.localeCompare(b.due_date));
    const { warnings } = getClientRevenueBreakdown(data.clients, invoices);
    const projectById = new Map(data.projects.map((project) => [project.id, project]));
    const unbilledByProject = [...data.unbilledTime.reduce((acc, entry) => {
        if (!entry.project_id) return acc;
        const current = acc.get(entry.project_id) ?? { hours: 0, amount: 0 };
        current.hours += Number(entry.hours);
        current.amount += Number(entry.hours) * Number(entry.rate ?? 0);
        acc.set(entry.project_id, current);
        return acc;
    }, new Map<string, { hours: number; amount: number }>())]
        .filter(([, total]) => total.amount > 0)
        .sort((a, b) => b[1].amount - a[1].amount);

    const count = overdueInvoices.length + overdueTasks.length + unbilledByProject.length + warnings.length;

    return (
        <Card className="gap-0 border-destructive/30 data-[clear=true]:border-border" data-clear={count === 0}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
                <CardTitle>
                    <Typography variant="cardTitle" as="h2">Needs attention</Typography>
                </CardTitle>
                {count > 0 && (
                    <Typography variant="metadataMedium" as="span" className="text-destructive">
                        {count} {count === 1 ? "item" : "items"}
                    </Typography>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {count === 0 ? (
                    <p className="flex items-center gap-2 px-5 py-4">
                        <CircleCheckIcon className="size-4 text-primary" aria-hidden />
                        <Typography variant="body" as="span">Nothing overdue or waiting to be billed. You&apos;re all caught up.</Typography>
                    </p>
                ) : (
                    <AttentionList rows={[
                        ...overdueInvoices.map((invoice) => (
                            <li key={invoice.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                                <AttentionIcon tone="destructive"><FileWarningIcon aria-hidden /></AttentionIcon>
                                <div className="flex min-w-[14rem] flex-1 flex-col">
                                    <Typography variant="body" as="span" className="font-medium">
                                        {formatMoney(invoice.total, invoice.currency, locale)} from {clientLabel(clientById.get(invoice.client_id))}
                                    </Typography>
                                    <Typography variant="bodySmall" color="muted" as="span">
                                        INV-{invoice.code}
                                        {projectTitle.get(invoice.project_id) ? ` · ${projectTitle.get(invoice.project_id)}` : ""}
                                        {" · "}
                                        <span className="text-destructive">{daysOverdue(invoice.due_date!, today)}</span>
                                    </Typography>
                                </div>
                                <div className="ml-11 sm:ml-0"><RecordPaymentButton invoice={invoice} /></div>
                            </li>
                        )),
                        ...overdueTasks.map((task) => (
                            <li key={task.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                                <AttentionIcon tone={task.priority === "high" ? "destructive" : "muted"}>
                                    <FlagSolidIcon className="size-4" />
                                </AttentionIcon>
                                <div className="flex min-w-[14rem] flex-1 flex-col">
                                    <Typography variant="body" as="span" className="font-medium">{task.title}</Typography>
                                    <Typography variant="bodySmall" color="muted" as="span">
                                        {projectTitle.get(task.project_id) ?? "Project"}
                                        {task.priority === "high" ? " · High priority" : ""}
                                        {" · "}
                                        <span className="text-destructive">{daysOverdue(task.due_date, today)}</span>
                                    </Typography>
                                </div>
                                <Button asChild variant="outline" size="sm" className="ml-11 sm:ml-0">
                                    <Link href={`/projects/${task.project_id}?tab=tasks`}>
                                        <ListTodoIcon aria-hidden />
                                        Open task
                                    </Link>
                                </Button>
                            </li>
                        )),
                        ...unbilledByProject.map(([projectId, total]) => {
                            const project = projectById.get(projectId);
                            return (
                                <li key={`unbilled-${projectId}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
                                    <AttentionIcon tone="muted"><ClockIcon aria-hidden /></AttentionIcon>
                                    <div className="flex min-w-[14rem] flex-1 flex-col">
                                        <Typography variant="body" as="span" className="font-medium">
                                            {formatMoney(total.amount, project?.currency || "USD", locale)} of unbilled time
                                        </Typography>
                                        <Typography variant="bodySmall" color="muted" as="span">
                                            {project?.title ?? "Project"} · {total.hours.toFixed(1)} h logged, not yet invoiced
                                        </Typography>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="ml-11 sm:ml-0">
                                        <Link href={`/invoices/new?project=${projectId}&time=unbilled`}>
                                            <ReceiptIcon aria-hidden />
                                            Invoice it
                                        </Link>
                                    </Button>
                                </li>
                            );
                        }),
                        ...warnings.map((warning, index) => (
                            <li key={`warning-${index}`} className="flex items-center gap-3 px-5 py-3">
                                <AttentionIcon tone="warning"><AlertTriangleIcon aria-hidden /></AttentionIcon>
                                <div className="flex min-w-[14rem] flex-1 flex-col">
                                    <Typography variant="body" as="span"><RevenueWarningText warning={warning} /></Typography>
                                    <Typography variant="bodySmall" color="muted" as="span">Revenue risk · all-time paid invoices</Typography>
                                </div>
                            </li>
                        )),
                    ]} />
                )}
            </CardContent>
        </Card>
    );
}

function AttentionIcon({ tone, children }: { tone: "destructive" | "warning" | "muted"; children: React.ReactNode }) {
    const toneClass = {
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-warning/10 text-warning",
        muted: "bg-muted text-muted-foreground",
    }[tone];
    return (
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4 ${toneClass}`} aria-hidden>
            {children}
        </span>
    );
}
