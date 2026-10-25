import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/data/clients";
import { getProjects } from "@/lib/data/projects";
import { getInvoiceWithLineItems, type InvoiceWithLineItems } from "@/lib/data/invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { InvoiceFormPage } from "../../(components)/invoice-form-page";

async function EditInvoicePageContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    let invoice: InvoiceWithLineItems | null = null;
    try {
        invoice = await getInvoiceWithLineItems(id);
    } catch {
        notFound();
    }
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

    const [projects, clients] = await Promise.all([getProjects(user.id), getClients()]);

    return <InvoiceFormPage projects={projects ?? []} clients={clients ?? []} invoice={invoice} />;
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditInvoicePageContent params={params} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Edit Invoice",
    description: "Edit an invoice",
};
