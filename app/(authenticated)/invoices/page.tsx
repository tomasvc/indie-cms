import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { InvoicesPageContent } from "./(components)/invoices-page-content";

export default function Invoices() {
    return <InvoicesPageContent />;
}

export const metadata: Metadata = {
    title: "Invoices",
    description: "Who owes you what, and what has been paid.",
}
