"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { invoiceTotal, isOutstanding, isOverdue } from "@/lib/helpers/invoices";
import { currencyOf, formatMoneyByCurrency, sumByCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { invoicesQuery } from "@/lib/queries/invoices";
import { clientsQuery } from "@/lib/queries/clients";
import { projectsQuery } from "@/lib/queries/projects";
import { InvoicesTable } from "./invoices-table";
import { InvoicesPageFallback } from "./invoices-fallback";

export function InvoicesPageContent() {
    const { data: invoices } = useQuery(invoicesQuery);
    const { data: clients } = useQuery(clientsQuery);
    const { data: projects } = useQuery(projectsQuery);

    if (!invoices || !clients || !projects) return <InvoicesPageFallback />;

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
    );
}
