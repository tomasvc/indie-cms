import { getClients } from "@/lib/data/clients";
import { getProjects } from "@/lib/data/projects";
import { getNextInvoiceCode } from "@/lib/data/invoices";
import { getProfile } from "@/lib/data/settings";
import { DEFAULT_PAYMENT_TERMS_DAYS } from "@/lib/helpers/invoices";
import { addDaysISO, todayISO } from "@/lib/money";
import { getTimeEntriesForProject } from "@/lib/data/time-entries";
import { isUnbilled, timeEntriesToLineItems } from "@/lib/helpers/time-entries";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceFormPage } from "../(components)/invoice-form-page";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { Suspense } from "react";

type NewInvoiceSearchParams = Promise<{ project?: string; client?: string; time?: string }>;

async function NewInvoicePageContent({ searchParams }: { searchParams: NewInvoiceSearchParams }) {
    const { project: projectParam, client: clientParam, time: timeParam } = await searchParams;
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

    const issueDate = todayISO();
    const hourlyRate = Number(profile?.hourly_rate);
    // Arriving from a project or client page pre-selects it (and the project's client and currency)
    const project = projects.find((p) => p.id === projectParam);
    const clientId = project?.client_id ?? clients.find((c) => c.id === clientParam)?.id;
    // ?time=unbilled turns the project's unbilled time into the invoice's lines
    const unbilledTime = project && timeParam === "unbilled"
        ? (await getTimeEntriesForProject(project.id)).filter(isUnbilled)
        : [];
    const projectRate = Number(project?.hourly_rate);

    return (
        <InvoiceFormPage
            projects={projects}
            clients={clients}
            defaults={{
                code: nextCode,
                currency: project?.currency || profile?.currency || "USD",
                issueDate,
                dueDate: addDaysISO(issueDate, DEFAULT_PAYMENT_TERMS_DAYS),
                projectId: project?.id,
                clientId,
                hourlyRate: projectRate > 0 ? projectRate : Number.isFinite(hourlyRate) && hourlyRate > 0 ? hourlyRate : 0,
                timeLineItems: timeEntriesToLineItems(unbilledTime),
                timeEntryIds: unbilledTime.map((entry) => entry.id),
            }}
        />
    );
}

export default function NewInvoicePage({ searchParams }: { searchParams: NewInvoiceSearchParams }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewInvoicePageContent searchParams={searchParams} />
        </Suspense>
    );
}

export const metadata: Metadata = {
    title: "New Invoice",
    description: "Create a new invoice",
};
