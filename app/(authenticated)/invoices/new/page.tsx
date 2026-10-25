import { getClients } from "@/lib/data/clients";
import { getProjects } from "@/lib/data/projects";
import { getNextInvoiceCode } from "@/lib/data/invoices";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceFormPage } from "../(components)/invoice-form-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";

async function NewInvoicePageContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    let projects, clients, nextCode;
    try {
        [projects, clients, nextCode] = await Promise.all([
            getProjects(user.id),
            getClients(),
            getNextInvoiceCode(user.id),
        ]);
        if (!projects || !clients) notFound();
    } catch {
        notFound();
    }

    return <InvoiceFormPage projects={projects} clients={clients} defaultCode={nextCode} />;
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewInvoicePageContent />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "New Invoice",
    description: "Create a new invoice",
};
