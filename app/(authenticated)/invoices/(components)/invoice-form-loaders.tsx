"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { InvoiceFormFallback } from "./invoice-form-fallback";
import { DEFAULT_PAYMENT_TERMS_DAYS } from "@/lib/helpers/invoices";
import { isUnbilled, timeEntriesToLineItems } from "@/lib/helpers/time-entries";
import { addDaysISO, todayISO } from "@/lib/money";
import { clientsQuery } from "@/lib/queries/clients";
import { projectsQuery } from "@/lib/queries/projects";
import { invoiceQuery, invoicesQuery, nextInvoiceCode } from "@/lib/queries/invoices";
import { projectTimeEntriesQuery } from "@/lib/queries/time-entries";
import { profileQuery } from "@/lib/queries/account";
import { InvoiceFormPage } from "./invoice-form-page";

type NewInvoiceSearchParams = Promise<{ project?: string; client?: string; time?: string }>;

export function NewInvoicePage({ searchParams }: { searchParams: NewInvoiceSearchParams }) {
    const { project: projectParam, client: clientParam, time: timeParam } = use(searchParams);
    const { data: projects } = useQuery(projectsQuery);
    const { data: clients } = useQuery(clientsQuery);
    const { data: nextCode } = useQuery({ ...invoicesQuery, select: nextInvoiceCode });
    const { data: profile } = useQuery(profileQuery);
    // Arriving from a project or client page pre-selects it (and the project's client and currency)
    const project = projects?.find((p) => p.id === projectParam);
    // ?time=unbilled turns the project's unbilled time into the invoice's lines
    const billTime = !!project && timeParam === "unbilled";
    const { data: unbilledTime } = useQuery({
        ...projectTimeEntriesQuery(project?.id ?? ""),
        select: (entries) => entries.filter(isUnbilled),
        enabled: billTime,
    });

    if (!projects || !clients || !nextCode || profile === undefined || (billTime && !unbilledTime)) return <InvoiceFormFallback />;

    const timeEntries = billTime ? unbilledTime ?? [] : [];
    const clientId = project?.client_id ?? clients.find((c) => c.id === clientParam)?.id;
    const issueDate = todayISO();
    const hourlyRate = Number(profile?.hourly_rate);
    const projectRate = Number(project?.hourly_rate);

    return (
        <InvoiceFormPage
            projects={projects}
            clients={clients}
            defaults={{
                code: nextCode,
                currency: project?.currency || profile?.currency || "USD",
                issueDate,
                dueDate: addDaysISO(issueDate, DEFAULT_PAYMENT_TERMS_DAYS),
                projectId: project?.id,
                clientId,
                hourlyRate: projectRate > 0 ? projectRate : Number.isFinite(hourlyRate) && hourlyRate > 0 ? hourlyRate : 0,
                timeLineItems: timeEntriesToLineItems(timeEntries),
                timeEntryIds: timeEntries.map((entry) => entry.id),
            }}
        />
    );
}

export function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: invoice } = useQuery(invoiceQuery(id));
    const { data: projects } = useQuery(projectsQuery);
    const { data: clients } = useQuery(clientsQuery);

    if (invoice === undefined || !projects || !clients) return <InvoiceFormFallback />;
    if (!invoice) notFound();

    if (invoice.status === "paid") {
        return (
            <Card className="animate-fadein">
                <CardContent className="p-5 flex flex-col gap-3 items-start">
                    <Typography variant="cardTitle" as="h1">INV-{invoice.code} has been paid</Typography>
                    <Typography variant="body" color="muted" as="p">
                        Paid invoices can&apos;t be edited. Mark it as unpaid from the invoices list first.
                    </Typography>
                    <Button variant="outline" asChild>
                        <Link href="/invoices">Back to invoices</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return <InvoiceFormPage projects={projects} clients={clients} invoice={invoice} />;
}
