import { getClients } from "@/lib/actions/clients";
import { getProjects } from "@/lib/actions/projects";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoicePage } from "../(components)/create-invoice-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";

async function NewInvoicePageContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    let projects, clients;
    try {
        [projects, clients] = await Promise.all([
            getProjects(user.id),
            getClients(),
        ]);
        if (!projects || !clients) notFound();
    } catch {
        notFound();
    }

    return <CreateInvoicePage projects={projects} clients={clients} />;
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
