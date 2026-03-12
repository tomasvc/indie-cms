import { DashboardCoreData } from "@/lib/queries/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Typography } from "../../../../components/ui/typography"
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { format, isAfter, parseISO } from "date-fns";
import { Invoice } from "@/types";

type OverdueInvoicesProps = {
    data: DashboardCoreData;
};

export function OverdueInvoices({ data }: OverdueInvoicesProps) {
    const invoices = data.invoices;
    const overdueInvoices = invoices.filter(invoice => invoice.status === "overdue");
    const upcomingInvoices = invoices.filter(invoice => invoice.due_date && isAfter(parseISO(invoice.due_date), new Date()) && invoice.status !== "paid");
    const overdueOrUpcomingInvoices = [...overdueInvoices, ...upcomingInvoices];

    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Overdue / Upcoming Invoices</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your overdue and upcoming invoices.</Typography></CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {overdueOrUpcomingInvoices.length === 0 ? (
                    <div className="p-5">
                        <Typography variant="body" color="muted" as="span">No overdue or upcoming invoices</Typography>
                    </div>
                ) : (
                    <Table className="p-0">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4">Invoice</TableHead>
                                <TableHead className="px-4">Client</TableHead>
                                <TableHead className="px-4">Amount</TableHead>
                                <TableHead className="px-4">Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueOrUpcomingInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="px-4 py-3">
                                        <Typography variant="code" as="span">{invoice.code}</Typography>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Typography variant="body" as="span">{data.clients.find(c => c.id === invoice.client_id)?.name}</Typography>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Typography variant="body" as="span" className="font-medium">{Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.amount)}</Typography>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Typography variant="metadata" as="span">{format(new Date(invoice.due_date), "MMM d, yyyy")}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}