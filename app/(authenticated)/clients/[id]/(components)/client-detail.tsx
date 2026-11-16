"use client";

import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, FileTextIcon, FolderKanbanIcon, GlobeIcon, MailIcon, MapPinIcon, PhoneIcon, PlusIcon } from "lucide-react";
import { ClientStatusBadge } from "@/components/client-status-badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getClientTotals, totalsFor } from "@/lib/helpers/clients";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";
import { displayStatus } from "@/lib/helpers/invoices";
import { formatMoneyByCurrency } from "@/lib/money";
import { clientsQuery } from "@/lib/queries/clients";
import { projectsQuery } from "@/lib/queries/projects";
import { invoicesQuery } from "@/lib/queries/invoices";
import { profileQuery } from "@/lib/queries/account";
import { InvoiceStatusBadge } from "../../../invoices/(components)/invoice-status-badge";
import { ClientDetailFallback } from "./client-detail-fallback";
import { EditClientDialog } from "./edit-client-dialog";
import { CreateProjectDialog } from "../../../projects/(components)/create-project-dialog";

const PROJECT_STATUS_ORDER: Record<string, number> = { active: 0, review: 1, on_hold: 2, proposal: 3, draft: 4, completed: 5, archived: 6 };

export function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: client, isFetching } = useQuery({ ...clientsQuery, select: (clients) => clients.find((c) => c.id === id) ?? null });
    const { data: projects } = useQuery(projectsQuery);
    const { data: invoices } = useQuery(invoicesQuery);
    const { data: profile } = useQuery(profileQuery);
    const isMutating = useIsMutating() > 0;

    // A client created moments ago isn't in the cached list until the refetch lands, and one being
    // deleted disappears before the redirect does
    if (!client && (isFetching || isMutating)) return <ClientDetailFallback />;
    if (!projects || !invoices || profile === undefined) return <ClientDetailFallback />;
    if (!client) notFound();

    const locale = profile?.language || "en";
    const currency = profile?.currency || "USD";
    const clientProjects = projects
        .filter((project) => project.client_id === client.id)
        .sort((a, b) => (PROJECT_STATUS_ORDER[a.status] ?? 9) - (PROJECT_STATUS_ORDER[b.status] ?? 9) || (a.due_date ?? "").localeCompare(b.due_date ?? ""));
    const clientInvoices = invoices.filter((invoice) => invoice.client_id === client.id);
    const projectTitle = new Map(clientProjects.map((project) => [project.id, project.title]));
    const totals = totalsFor(getClientTotals(clientInvoices), client.id);
    const activeProjects = clientProjects.filter((project) => project.status === "active" || project.status === "review").length;
    const hasOwed = Object.values(totals.owed).some((amount) => amount > 0);

    const stats = [
        { label: "Billed", value: formatMoneyByCurrency(totals.billed, locale, currency), sub: `${totals.invoiceCount} sent ${totals.invoiceCount === 1 ? "invoice" : "invoices"}` },
        { label: "Paid", value: formatMoneyByCurrency(totals.paid, locale, currency), sub: "all time" },
        { label: "Owed to you", value: formatMoneyByCurrency(totals.owed, locale, currency), sub: hasOwed ? "sent, not yet paid" : "nothing outstanding" },
        { label: "Active projects", value: String(activeProjects), sub: `${clientProjects.length} in total` },
    ];

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div>
                <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
                    <Link href="/clients"><ArrowLeftIcon aria-hidden />Clients</Link>
                </Button>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Typography variant="pageTitle" as="h1" className="truncate">{client.company || client.name}</Typography>
                            <ClientStatusBadge status={client.status} />
                        </div>
                        <Typography variant="subtitle" as="p">
                            {client.company ? client.name : "Individual client"}
                            {client.created_at ? ` · Client since ${formatLocalDate(client.created_at.slice(0, 10), locale, { month: "long", year: "numeric" })}` : ""}
                        </Typography>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <EditClientDialog client={client} />
                        <CreateProjectDialog
                            clientId={client.id}
                            trigger={<Button variant="outline"><FolderKanbanIcon aria-hidden />New project</Button>}
                        />
                        <Button asChild>
                            <Link href={`/invoices/new?client=${client.id}`}><PlusIcon aria-hidden />New invoice</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="grid grid-cols-2 lg:grid-cols-4 gap-0 p-0">
                {stats.map((stat, index) => (
                    <div key={stat.label} className={`flex flex-col gap-1 p-4 ${index % 2 === 1 ? "border-l" : ""} ${index < 2 ? "border-b lg:border-b-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}>
                        <Typography variant="kpiLabel" as="p">{stat.label}</Typography>
                        <Typography variant="kpiValue" as="p" className="tabular-nums break-words">{stat.value}</Typography>
                        <Typography variant="kpiSub" as="p">{stat.sub}</Typography>
                    </div>
                ))}
            </Card>

            <div className="grid gap-3 lg:grid-cols-3">
                <div className="flex flex-col gap-3 lg:col-span-2">
                    <Card className="gap-0 pb-0">
                        <CardHeader className="border-b">
                            <CardTitle><Typography variant="cardTitle" as="h2">Projects</Typography></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {clientProjects.length === 0 ? (
                                <p className="px-4 py-5 text-[14px] text-muted-foreground">No projects for this client yet.</p>
                            ) : (
                                <ul className="divide-y">
                                    {clientProjects.map((project) => (
                                        <li key={project.id}>
                                            <Link href={`/projects/${project.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
                                                <span className="min-w-0">
                                                    <span className="block truncate text-[14px] font-medium text-foreground">{project.title}</span>
                                                    <span className="block text-[13px] text-muted-foreground">
                                                        {project.due_date ? `Due ${formatLocalDate(project.due_date, locale)}` : "No due date"}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-3">
                                                    <span className="text-[14px] tabular-nums text-foreground">{formatMoney(Number(project.value) || 0, project.currency || currency, locale)}</span>
                                                    <ProjectStatusBadge status={project.status} />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 pb-0">
                        <CardHeader className="border-b">
                            <CardTitle><Typography variant="cardTitle" as="h2">Invoices</Typography></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {clientInvoices.length === 0 ? (
                                <p className="px-4 py-5 text-[14px] text-muted-foreground">No invoices for this client yet.</p>
                            ) : (
                                <ul className="divide-y">
                                    {clientInvoices.map((invoice) => (
                                        <li key={invoice.id}>
                                            <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none">
                                                <span className="min-w-0">
                                                    <span className="flex items-center gap-2 text-[14px] text-foreground">
                                                        <FileTextIcon className="size-3.5 text-muted-foreground" aria-hidden />
                                                        <span className="font-mono">INV-{invoice.code}</span>
                                                    </span>
                                                    <span className="block truncate text-[13px] text-muted-foreground">
                                                        {projectTitle.get(invoice.project_id) ?? "Other project"}
                                                        {invoice.status === "paid" && invoice.paid_date
                                                            ? ` · Paid ${formatLocalDate(invoice.paid_date, locale)}`
                                                            : invoice.due_date ? ` · Due ${formatLocalDate(invoice.due_date, locale)}` : ""}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-3">
                                                    <span className="text-[14px] tabular-nums text-foreground">{formatMoney(invoice.total, invoice.currency, locale)}</span>
                                                    <InvoiceStatusBadge status={displayStatus(invoice)} />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit gap-0">
                    <CardHeader className="border-b">
                        <CardTitle><Typography variant="cardTitle" as="h2">Contact</Typography></CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 py-4 text-[14px]">
                        <ContactRow icon={<MailIcon />} label="Email">
                            {client.email ? <a href={`mailto:${client.email}`} className="hover:underline underline-offset-4">{client.email}</a> : null}
                        </ContactRow>
                        <ContactRow icon={<PhoneIcon />} label="Phone">
                            {client.phone ? <a href={`tel:${client.phone}`} className="hover:underline underline-offset-4">{client.phone}</a> : null}
                        </ContactRow>
                        <ContactRow icon={<GlobeIcon />} label="Website">
                            {client.website ? <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline underline-offset-4 break-all">{client.website}</a> : null}
                        </ContactRow>
                        <ContactRow icon={<MapPinIcon />} label="Address">
                            {client.address ? <span className="whitespace-pre-line">{[client.address, client.country].filter(Boolean).join(", ")}</span> : null}
                        </ContactRow>
                        {client.vat_number && <ContactRow label="VAT number">{client.vat_number}</ContactRow>}
                        <ContactRow label="Last contact">
                            {client.last_contact ? formatLocalDate(client.last_contact, locale) : null}
                        </ContactRow>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ContactRow({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-3.5" aria-hidden>{icon}</span>
            <div className="min-w-0">
                <p className="text-[13px] text-muted-foreground">{label}</p>
                <div className="text-foreground">{children ?? <span className="text-muted-foreground">Not added</span>}</div>
            </div>
        </div>
    );
}
