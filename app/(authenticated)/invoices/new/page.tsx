import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";
import { InvoiceFormFallback } from "../(components)/invoice-form-fallback";
import { NewInvoicePage as NewInvoicePageContent } from "../(components)/invoice-form-loaders";

export default function NewInvoicePage({ searchParams }: { searchParams: Promise<{ project?: string; client?: string; time?: string }> }) {
    return (
        <Suspense fallback={<InvoiceFormFallback />}>
            <NewInvoicePageContent searchParams={searchParams} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "New Invoice",
    description: "Create a new invoice",
};
