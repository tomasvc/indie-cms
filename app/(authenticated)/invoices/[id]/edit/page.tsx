import { Suspense } from "react";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { InvoiceFormFallback } from "../../(components)/invoice-form-fallback";
import { EditInvoicePage as EditInvoicePageContent } from "../../(components)/invoice-form-loaders";

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<InvoiceFormFallback />}>
            <EditInvoicePageContent params={params} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Edit Invoice",
    description: "Edit an invoice",
};
