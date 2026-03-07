import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/lib/actions/projects";
import { handleDeleteProject } from "@/lib/actions/projects";
import { getTasksForProject } from "@/lib/actions/tasks";
import { getTimeEntriesForProject } from "@/lib/actions/time-entries";
import { ProjectOverview } from "./(components)/project-overview";
import { ProjectTasks } from "./(components)/project-tasks";
import { ProjectTime } from "./(components)/project-time";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StarIcon, PencilIcon } from "lucide-react";
import { formatDate, format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Client, Project as ProjectType } from "@/types";
import { DeleteProjectButton } from "./(components)/delete-project-button";
import Link from "next/link";
import { getClients } from "@/lib/actions/clients";
import { ProjectDetailFallback } from "./(components)/project-detail-fallback";
import { Typography } from "@/components/ui/typography";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

async function Project({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [project, clients, tasks, timeEntries] = await Promise.all([
        getProject(id),
        getClients(),
        getTasksForProject(id),
        getTimeEntriesForProject(id)
    ]);

    if (!project || !clients) {
        notFound();
    }

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
    const unbilledAmount = timeEntries
        .filter((e) => e.billable && !e.invoice_id)
        .reduce((sum, e) => sum + e.hours * e.rate, 0);

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col justify-between mb-2">
                        <Typography variant="pageTitle" as="h1">{project.title}</Typography>
                        <Typography variant="subtitle" className="mb-0">{project.description}</Typography>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon-lg" variant="secondary" aria-label="Star">
                            <StarIcon className="size-4" />
                        </Button>
                        <Button size="lg" variant="secondary" asChild>
                            <Link href={`/projects/${id}/edit`}>
                                <PencilIcon className="size-3 mb-0.5" />
                                Edit
                            </Link>
                        </Button>
                        <DeleteProjectButton id={id} deleteProject={handleDeleteProject} iconOnly />
                    </div>
                </div>
                <div className="flex gap-4 items-center flex-wrap">
                    <Badge variant="secondary">
                        <span className="size-2 rounded-full bg-primary" aria-hidden />
                        <Typography variant="badge" className="capitalize">{project.status.replace("_", " ")}</Typography>
                    </Badge>
                    <span className="text-muted-foreground">
                        <Typography variant="labelUppercase" as="span">Progress:</Typography>{" "}
                        <Typography variant="metadataStrong" as="span">{project.progress}%</Typography>
                    </span>
                    <span className="text-muted-foreground">
                        <Typography variant="labelUppercase" as="span">Value:</Typography>{" "}
                        <Typography variant="metadataStrong" as="span">{Intl.NumberFormat("en-US", { style: "currency", currency: project.currency || "USD" }).format(project.value)}</Typography>
                    </span>
                    <span className="text-muted-foreground">
                        <Typography variant="labelUppercase" as="span">Due:</Typography>{" "}
                        <Typography variant="metadataStrong" as="span">{formatDate(project.due_date ?? "", "MMM d, yyyy")}</Typography>
                    </span>
                </div>
            </div>
            <Tabs defaultValue="overview" className="flex flex-col gap-4">
                <TabsList variant="line">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="time">Time</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <ProjectOverview
                        project={project}
                        client={project.client_id ? clients.find((client) => client.id === project.client_id) ?? null : null}
                        sparklineData={sparklineData}
                        unbilledAmount={unbilledAmount}
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
                        currency={project.currency ?? "USD"}
                        defaultHourlyRate={0}
                    />
                </TabsContent>
                <TabsContent value="files">
                    <div className="flex flex-col items-center justify-center min-h-[240px] border border-dashed border-muted rounded-lg bg-muted/40 text-center p-6">
                        <svg width="44" height="44" viewBox="0 0 24 24" className="mx-auto mb-3 text-muted-foreground opacity-70" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="3" />
                            <path d="M8 3v4M16 3v4" />
                            <path d="M3 10h18" />
                        </svg>
                        <Typography variant="subtitle" className="mb-1">
                            Files are coming soon!
                        </Typography>
                        <Typography variant="bodySmall" color="muted">
                            File tracking for this project will be available in a future update.<br />
                            Stay tuned for improvements.
                        </Typography>
                    </div>
                </TabsContent>
                <TabsContent value="invoices">
                    <div className="flex flex-col items-center justify-center min-h-[240px] border border-dashed border-muted rounded-lg bg-muted/40 text-center p-6">
                        <svg width="44" height="44" viewBox="0 0 24 24" className="mx-auto mb-3 text-muted-foreground opacity-70" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="3" />
                            <path d="M8 3v4M16 3v4" />
                            <path d="M3 10h18" />
                        </svg>
                        <Typography variant="subtitle" className="mb-1">
                            Project invoices are coming soon!
                        </Typography>
                        <Typography variant="bodySmall" color="muted">
                            Invoice tracking for this project will be available in a future update.<br />
                            Stay tuned for improvements.
                        </Typography>
                    </div>
                </TabsContent>
                <TabsContent value="notes">
                    <div className="flex flex-col items-center justify-center min-h-[240px] border border-dashed border-muted rounded-lg bg-muted/40 text-center p-6">
                        <svg width="44" height="44" viewBox="0 0 24 24" className="mx-auto mb-3 text-muted-foreground opacity-70" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="3" />
                            <path d="M8 3v4M16 3v4" />
                            <path d="M3 10h18" />
                        </svg>
                        <Typography variant="subtitle" className="mb-1">
                            Notes are coming soon!
                        </Typography>
                        <Typography variant="bodySmall" color="muted">
                            Note tracking for this project will be available in a future update.<br />
                            Stay tuned for improvements.
                        </Typography>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<ProjectDetailFallback />}>
            <Project params={params} />
        </Suspense>
    );
} 