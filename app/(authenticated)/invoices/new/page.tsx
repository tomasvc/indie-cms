import { getClients } from "@/lib/data/clients";
import { getProjects } from "@/lib/data/projects";
import { getNextInvoiceCode } from "@/lib/data/invoices";
import { getProfile } from "@/lib/data/settings";
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

    let projects, clients, nextCode, profile;
    try {
        [projects, clients, nextCode, profile] = await Promise.all([
            getProjects(user.id),
            getClients(),
            getNextInvoiceCode(user.id),
            getProfile(),
        ]);
        if (!projects || !clients) notFound();
    } catch {
        notFound();
    }

    return (
        <InvoiceFormPage
            projects={projects}
            clients={clients}
            defaultCode={nextCode}
            defaultCurrency={profile?.currency || "USD"}
        />
    );
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
