import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDocument, type InvoiceDocumentData } from "@/components/invoice-document";
import { Skeleton } from "@/components/ui/skeleton";
import { id } from "@/lib/schemas/common";
import { PrintButton } from "@/app/(authenticated)/invoices/(components)/print-button";

type SharedInvoice = {
    invoice: Omit<InvoiceDocumentData, "items" | "from" | "to" | "project"> & { status: string };
    items: InvoiceDocumentData["items"];
    from: InvoiceDocumentData["from"] & { language?: string | null };
    to: InvoiceDocumentData["to"];
    project: string | null;
};

async function SharedInvoiceContent({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    if (!id().safeParse(token).success) notFound();

    // get_shared_invoice is a security-definer function: it only ever returns the one invoice
    // whose share token matches, and nothing once sharing is turned off or the invoice is void.
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_shared_invoice", { p_token: token });
    if (error || !data) notFound();

    const shared = data as SharedInvoice;
    const locale = shared.from.language || "en";
    const isPaid = shared.invoice.status === "paid";

    return (
        <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                    <p className="text-[14px] text-muted-foreground">
                        {isPaid ? "This invoice has been paid. Thank you." : `Invoice from ${shared.from.company_name || shared.from.full_name}`}
                    </p>
                    <PrintButton />
                </div>
                <InvoiceDocument
                    locale={locale}
                    invoice={{ ...shared.invoice, items: shared.items, from: shared.from, to: shared.to, project: shared.project }}
                />
            </div>
        </main>
    );
}

export default function SharedInvoicePage({ params }: { params: Promise<{ token: string }> }) {
    return (
        <Suspense
            fallback={
                <main className="mx-auto max-w-3xl px-4 py-12" aria-busy="true">
                    <Skeleton className="h-[480px] w-full rounded-xl" />
                </main>
            }
        >
            <SharedInvoiceContent params={params} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Invoice",
    description: "A shared invoice.",
    robots: { index: false, follow: false },
};
