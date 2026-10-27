import { Suspense } from "react";
import { getInvoices } from "@/lib/data/invoices";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicesTable } from "./(components)/invoices-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { invoiceTotal, isOutstanding, isOverdue } from "@/lib/helpers/invoices";
import { currencyOf, formatMoneyByCurrency, sumByCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getClients } from "@/lib/data/clients";
import { getProjects } from "@/lib/data/projects";

async function InvoicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }
    const [invoices, clients, projects] = await Promise.all([
        getInvoices(user.id),
        getClients(),
        getProjects(user.id),
    ]);

    if (!invoices || !clients || !projects) {
        notFound();
    }

    const outstanding = invoices.filter(isOutstanding);
    const overdue = outstanding.filter((invoice) => isOverdue(invoice));
    const owed = sumByCurrency(outstanding, invoiceTotal, currencyOf);
    const overdueOwed = sumByCurrency(overdue, invoiceTotal, currencyOf);

    return (
        <div className="flex min-w-0 flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="pageTitle" as="h1">Invoices</Typography>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Who owes you what, and what has been paid.
                    </p>
                </div>
                <div>
                    <Button asChild>
                        <Link href="/invoices/new">
                            <PlusIcon aria-hidden />
                            New Invoice
                        </Link>
                    </Button>
                </div>
            </div>
            <Card className="flex flex-row flex-wrap gap-x-10 gap-y-4 px-5 py-4">
                <div>
                    <Typography variant="kpiLabel" as="p">Owed to you</Typography>
                    <Typography variant="kpiValue" as="p" className="tabular-nums mt-1">
                        {formatMoneyByCurrency(owed)}
                    </Typography>
                    <Typography variant="kpiSub" as="p">
                        {outstanding.length} sent {outstanding.length === 1 ? "invoice" : "invoices"} not yet paid
                    </Typography>
                </div>
                <div>
                    <Typography variant="kpiLabel" as="p">Overdue</Typography>
                    <Typography variant="kpiValue" as="p" className={cn("tabular-nums mt-1", overdue.length > 0 && "text-destructive")}>
                        {formatMoneyByCurrency(overdueOwed)}
                    </Typography>
                    <Typography variant="kpiSub" as="p">
                        {overdue.length === 0 ? "Nothing overdue" : `${overdue.length} past ${overdue.length === 1 ? "its" : "their"} due date`}
                    </Typography>
                </div>
            </Card>
            <InvoicesTable invoices={invoices} clients={clients} projects={projects} />
        </div>
    )
}

export default function Invoices() {
    return (
        <Suspense fallback={<Fallback />}>
            <InvoicesPage />
        </Suspense>
    );
}

const Fallback = () => {
    return (
        <div className="flex min-w-0 flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Card className="flex flex-row gap-10 px-5 py-4">
                {[0, 1].map((i) => (
                    <div key={i}>
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-6 w-28 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </Card>
            <Card className="p-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                    <Skeleton className="h-8 w-full sm:w-56" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-8 w-44" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due date</TableHead>
                            <TableHead>Issue date</TableHead>
                            <TableHead>Paid date</TableHead>
                            <TableHead className="pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="pl-4"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="pr-4 text-right"><Skeleton className="h-8 w-8 rounded" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export const metadata: Metadata = {
    title: "Invoices",
    description: "Who owes you what, and what has been paid.",
}