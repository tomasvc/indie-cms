import { DashboardCoreData } from "@/lib/queries/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Invoice } from "@/types"
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { format } from "date-fns";

type OverdueInvoicesProps = {
    data: DashboardCoreData;
};

export function OverdueInvoices({ data }: OverdueInvoicesProps) {
    const invoices = data.invoices;
    const overdueOrUpcomingInvoices = invoices.filter(invoice => invoice.status === "overdue" || invoice.status === "upcoming");

    return (
        <Card className="gap-0 pb-0">
            <CardHeader className="border-b">
                <CardTitle>Overdue / Upcoming Invoices</CardTitle>
                <CardDescription>This is a summary of your overdue and upcoming invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                                <TableCell className="px-4 py-3 font-mono">{invoice.number}</TableCell>
                                <TableCell className="px-4 py-3">{data.clients.find(c => c.id === invoice.client_id)?.name}</TableCell>
                                <TableCell className="px-4 py-3">{Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.amount)}</TableCell>
                                <TableCell className="px-4 py-3 text-muted-foreground">{format(new Date(invoice.due_date), "MMM d, yyyy")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}