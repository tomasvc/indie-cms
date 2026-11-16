import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoiceDocumentFallback, InvoicePageContent } from "../(components)/invoice-page-content";

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
