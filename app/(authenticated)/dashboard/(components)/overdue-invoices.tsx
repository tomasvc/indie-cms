import type { DashboardCoreData } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";
import { isOutstanding, isOverdue } from "@/lib/helpers/invoices";
import { clientLabel } from "@/lib/helpers/clients";
import type { Invoice } from "@/types";
import { RecordPaymentButton } from "../../invoices/(components)/record-payment-button";

type OverdueInvoicesProps = {
    data: DashboardCoreData;
    locale: string;
};

/** Sent, unpaid invoices, oldest due first. Rows rather than a table so it fits a half-width column. */
export function OverdueInvoices({ data, locale }: OverdueInvoicesProps) {
    const clientById = new Map(data.clients.map((client) => [client.id, client]));
    const projectTitle = new Map(data.projects.map((project) => [project.id, project.title]));
    const outstandingInvoices = (data.invoices as unknown as Invoice[])
        .filter((invoice) => isOutstanding(invoice) && invoice.due_date)
        .sort((a, b) => a.due_date!.localeCompare(b.due_date!));

    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="h2">Unpaid invoices</Typography></CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {outstandingInvoices.length === 0 ? (
                    <div className="px-5 py-4">
                        <Typography variant="body" color="muted" as="span">Nothing unpaid. Every sent invoice has been paid.</Typography>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {outstandingInvoices.map((invoice) => (
                            <li key={invoice.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                                <Link href={`/invoices/${invoice.id}`} className="flex min-w-[10rem] flex-1 flex-col rounded-sm hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <Typography variant="body" as="span" className="truncate font-medium">{clientLabel(clientById.get(invoice.client_id))}</Typography>
                                    <Typography variant="bodySmall" color="muted" as="span" className="truncate">
                                        INV-{invoice.code}{projectTitle.get(invoice.project_id) ? ` · ${projectTitle.get(invoice.project_id)}` : ""}
                                    </Typography>
                                </Link>
                                <div className="flex shrink-0 flex-col items-end">
                                    <Typography variant="body" as="span" className="font-semibold tabular-nums">{formatMoney(invoice.total, invoice.currency, locale)}</Typography>
                                    <span className="flex items-center gap-2">
                                        {isOverdue(invoice) && <Badge variant="destructive">Overdue</Badge>}
                                        <Typography variant="metadata" as="span">Due {formatLocalDate(invoice.due_date, locale)}</Typography>
                                    </span>
                                </div>
                                <RecordPaymentButton invoice={invoice} />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
