"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InvoiceDocument } from "@/components/invoice-document";
import { Skeleton } from "@/components/ui/skeleton";
import { displayStatus } from "@/lib/helpers/invoices";
import { invoiceQuery } from "@/lib/queries/invoices";
import { clientsQuery } from "@/lib/queries/clients";
import { projectsQuery } from "@/lib/queries/projects";
import { profileQuery, userQuery } from "@/lib/queries/account";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { PrintButton } from "./print-button";
import { InvoiceActions } from "./invoice-actions";

export function InvoicePageContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: invoice } = useQuery(invoiceQuery(id));
    const { data: clients } = useQuery(clientsQuery);
    const { data: projects } = useQuery(projectsQuery);
    const { data: profile } = useQuery(profileQuery);
    const { data: user } = useQuery(userQuery);

    if (invoice === undefined || !clients || !projects || profile === undefined || user === undefined) return <InvoiceDocumentFallback />;
    if (!invoice) notFound();

    const client = clients.find((c) => c.id === invoice.client_id) ?? null;
    const project = projects.find((p) => p.id === invoice.project_id);
    const locale = profile?.language || "en";
    const status = displayStatus(invoice);

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full animate-fadein">
            <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                <Button variant="ghost" asChild>
                    <Link href="/invoices"><ArrowLeftIcon aria-hidden />Invoices</Link>
                </Button>
                <div className="flex flex-wrap items-start justify-end gap-2">
                    <InvoiceActions invoice={invoice} />
                    {invoice.status !== "paid" && (
                        <Button variant="outline" asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}><PencilIcon aria-hidden />Edit</Link>
                        </Button>
                    )}
                    <PrintButton />
                </div>
            </div>

            <InvoiceDocument
                locale={locale}
                status={<InvoiceStatusBadge status={status} />}
                invoice={{
                    ...invoice,
                    items: [...invoice.items].sort((a, b) => a.position - b.position),
                    from: { ...profile, email: user?.email },
                    to: client,
                    project: project?.title,
                }}
            />
        </div>
    );
}

export function InvoiceDocumentFallback() {
    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full" aria-busy="true">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Skeleton className="h-9 w-28 rounded-md" />
                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-md" />)}
                </div>
            </div>
            <Card className="p-8 sm:p-10 gap-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-36" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-44" />)}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between border-b py-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between gap-6 border-b py-3">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
                <div className="ml-auto flex w-full max-w-64 flex-col gap-2">
                    <div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-20" /></div>
                    <div className="flex justify-between border-t pt-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24" /></div>
                </div>
            </Card>
        </div>
    );
}
