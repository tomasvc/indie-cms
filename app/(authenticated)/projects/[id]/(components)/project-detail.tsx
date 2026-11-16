"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { formatDate, format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { handleArchiveProject, handleDeleteProject } from "@/lib/actions/projects";
import { clientLabel } from "@/lib/helpers/clients";
import { unbilledAmount } from "@/lib/helpers/time-entries";
import { projectsQuery } from "@/lib/queries/projects";
import { clientsQuery } from "@/lib/queries/clients";
import { invoicesQuery } from "@/lib/queries/invoices";
import { projectTasksQuery } from "@/lib/queries/tasks";
import { projectTimeEntriesQuery } from "@/lib/queries/time-entries";
import { profileQuery } from "@/lib/queries/account";
import type { ProjectStatus } from "@/types";
import { ProjectOverview } from "./project-overview";
import { ProjectTasks } from "./project-tasks";
import { ProjectTime } from "./project-time";
import { ProjectInvoices } from "./project-invoices";
import { DeleteProjectButton } from "./delete-project-button";
import { ProjectDetailFallback } from "./project-detail-fallback";

const TABS = ["overview", "tasks", "time", "invoices"] as const;
type ProjectTab = (typeof TABS)[number];

export function ProjectDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
    const { id } = use(params);
    const { tab } = use(searchParams);
    // ?tab= lets other screens (e.g. "Open task" on the dashboard) land on the right tab
    const initialTab: ProjectTab = TABS.includes(tab as ProjectTab) ? (tab as ProjectTab) : "overview";
    const { data: project, isFetching } = useQuery({ ...projectsQuery, select: (projects) => projects.find((p) => p.id === id) ?? null });
    const { data: clients } = useQuery(clientsQuery);
    const { data: tasks } = useQuery(projectTasksQuery(id));
    const { data: timeEntries } = useQuery(projectTimeEntriesQuery(id));
    const { data: invoices } = useQuery({ ...invoicesQuery, select: (all) => all.filter((invoice) => invoice.project_id === id) });
    const { data: profile } = useQuery(profileQuery);
    const isMutating = useIsMutating() > 0;

    // A project created moments ago isn't in the cached list until the refetch lands, and one being
    // deleted disappears before the redirect does
    if (!project && (isFetching || isMutating)) return <ProjectDetailFallback />;
    if (!clients || !tasks || !timeEntries || !invoices || profile === undefined) return <ProjectDetailFallback />;
    if (!project) notFound();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sparklineData: { dateLabel: string; hours: number; entries: { description?: string | null; hours: number; rate: number; billable: boolean }[] }[] = [];
    for (let i = 0; i < 7; i++) {
        const d = subDays(today, 6 - i);
        const dateStr = format(d, "yyyy-MM-dd");
        const dayEntries = timeEntries.filter(
            (e) => (e.entry_date?.split("T")[0] ?? e.entry_date) === dateStr
        );
        const hours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
        sparklineData.push({
            dateLabel: format(d, "EEE, MMM d"),
            hours,
            entries: dayEntries.map((e) => ({
                description: e.description ?? null,
                hours: e.hours,
                rate: e.rate,
                billable: e.billable,
            })),
        });
    }
    const unbilled = unbilledAmount(timeEntries);
    const spent = timeEntries
        .filter((e) => e.billable !== false)
        .reduce((sum, e) => sum + e.hours * e.rate, 0);
    const loggedHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const client = project.client_id ? clients.find((c) => c.id === project.client_id) ?? null : null;
    const locale = profile?.language || "en";
    const hourlyRate = Number(profile?.hourly_rate);

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div>
                <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex flex-col mb-2 min-w-0">
                        <Typography variant="pageTitle" as="h1">{project.title}</Typography>
                        {project.description && <Typography variant="subtitle" className="mb-0">{project.description}</Typography>}
                    </div>
                    <div className="flex gap-1">
                        <Button variant="secondary" asChild>
                            <Link href={`/projects/${id}/edit`}>
                                <PencilIcon aria-hidden />
                                Edit
                            </Link>
                        </Button>
                        <DeleteProjectButton
                            id={id}
                            canDelete={invoices.length === 0 && timeEntries.length === 0}
                            isArchived={project.status === "archived"}
                            deleteProject={handleDeleteProject}
                            archiveProject={handleArchiveProject}
                            iconOnly
                        />
                    </div>
                </div>
                <div className="flex gap-x-4 gap-y-2 items-center flex-wrap text-[14px]">
                    <ProjectStatusBadge status={project.status as ProjectStatus} />
                    {client ? (
                        <Link href={`/clients/${client.id}`} className="text-foreground underline-offset-4 hover:underline">
                            {clientLabel(client)}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">No client</span>
                    )}
                    {project.due_date && (
                        <span className="text-muted-foreground">Due {formatDate(project.due_date, "d MMM yyyy")}</span>
                    )}
                </div>
            </div>
            <Tabs key={initialTab} defaultValue={initialTab} className="flex flex-col gap-4">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="time">Time</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices{invoices.length > 0 ? ` (${invoices.length})` : ""}</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <ProjectOverview
                        project={project}
                        client={client}
                        tasks={tasks}
                        sparklineData={sparklineData}
                        unbilledAmount={unbilled}
                        spent={spent}
                        loggedHours={loggedHours}
                    />
                </TabsContent>
                <TabsContent value="tasks">
                    <ProjectTasks projectId={id} tasks={tasks} />
                </TabsContent>
                <TabsContent value="time">
                    <ProjectTime
                        projectId={id}
                        timeEntries={timeEntries}
                        tasks={tasks}
                        currency={project.currency}
                        defaultHourlyRate={Number(project.hourly_rate) > 0 ? Number(project.hourly_rate) : Number.isFinite(hourlyRate) && hourlyRate > 0 ? hourlyRate : 0}
                        invoiceCodes={Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice.code]))}
                    />
                </TabsContent>
                <TabsContent value="invoices">
                    <ProjectInvoices projectId={id} invoices={invoices} locale={locale} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
