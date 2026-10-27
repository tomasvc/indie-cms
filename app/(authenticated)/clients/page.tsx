import { Suspense } from "react";
import { Typography } from "@/components/ui/typography";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClients } from "@/lib/data/clients";
import { getInvoices } from "@/lib/data/invoices";
import { getClientTotals, sortClients } from "@/lib/helpers/clients";
import { getProfile } from "@/lib/data/settings";
import { ClientsView } from "./(components)/clients-view";
import { CreateClientDialog } from "./(components)/create-client-dialog";
import { ClientsPageFallback } from "./(components)/clients-fallback";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function Clients() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [clients, invoices, profile] = await Promise.all([getClients(), getInvoices(user.id), getProfile()]);

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Typography variant="pageTitle" as="h1">Clients</Typography>
                    <p className="mt-1 text-[15px] text-muted-foreground">
                        Who you work with, what they&apos;ve been billed and what they owe.
                    </p>
                </div>
                <div>
                    <CreateClientDialog />
                </div>
            </div>
            <ClientsView
                clients={sortClients(clients ?? [])}
                totals={getClientTotals(invoices ?? [])}
                currency={profile?.currency || "USD"}
                locale={profile?.language || "en"}
            />
        </div>
    )
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<ClientsPageFallback />}>
            <Clients />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "Clients",
    description: "View and manage your clients.",
}