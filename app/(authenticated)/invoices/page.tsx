import { Suspense } from "react";
import { getInvoices } from "@/lib/actions/invoices";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoiceDialog } from "./(components)/create-invoice-dialog";
import { InvoicesTable } from "./(components)/invoices-table";
import { getProjects } from "@/lib/actions/projects";
import { getClients } from "@/lib/actions/clients";

async function InvoicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }
    const projects = await getProjects(user.id);
    const clients = await getClients();
    const invoices = await getInvoices(user.id);
    if (!invoices) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your invoices.
                    </p>
                </div>
                <div>
                    <CreateInvoiceDialog projects={projects} clients={clients} />
                </div>
            </div>
            <InvoicesTable invoices={invoices} />
        </div>
    )
}

export default function Invoices() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <InvoicesPage />
        </Suspense>
    );
}