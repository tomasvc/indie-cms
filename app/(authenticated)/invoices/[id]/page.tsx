import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClient } from "@/lib/data/clients";
import { getInvoiceWithLineItems, type InvoiceWithLineItems } from "@/lib/data/invoices";
import { getProject } from "@/lib/data/projects";
import { getProfile } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InvoiceDocument } from "@/components/invoice-document";
import { Skeleton } from "@/components/ui/skeleton";
import { displayStatus } from "@/lib/helpers/invoices";
import { InvoiceStatusBadge } from "../(components)/invoice-status-badge";
import { PrintButton } from "../(components)/print-button";
import { InvoiceActions } from "../(components)/invoice-actions";

async function InvoicePageContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    let invoice: InvoiceWithLineItems | null = null;
    try {
        invoice = await getInvoiceWithLineItems(id);
    } catch {
        notFound();
    }
    if (!invoice) notFound();

    const [profile, client, project] = await Promise.all([
        getProfile(),
        getClient(invoice.client_id),
        getProject(invoice.project_id).catch(() => null),
    ]);

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
                    from: { ...profile, email: user.email },
                    to: client,
                    project: project?.title,
                }}
            />
        </div>
    );
}

function InvoiceDocumentFallback() {
    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full" aria-busy="true">
            <div className="flex justify-between"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-44" /></div>
            <Card className="p-10 gap-8">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
            </Card>
        </div>
    );
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<InvoiceDocumentFallback />}>
            <InvoicePageContent params={params} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Invoice",
    description: "A printable invoice you can save as a PDF.",
};
