import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { ClientsPageContent } from "./(components)/clients-page-content";

export default function ClientsPage() {
    return <ClientsPageContent />;
}

export const metadata: Metadata = {
    title: "Clients",
    description: "View and manage your clients.",
}
