import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProject } from "@/lib/actions";
import { handleDeleteProject } from "@/lib/actions/projects";
import { ProjectOverview } from "./(components)/project-overview";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import { formatDate } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Client, Project as ProjectType } from "@/types";
import { DeleteProjectButton } from "./(components)/delete-project-button";
import { EditProjectDialog } from "./(components)/edit-project-dialog";
import { handleUpdateProject } from "@/lib/actions/projects";
import { getClients } from "@/lib/actions/clients";

async function Project({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let project: ProjectType | null = null;
    let clients: Client[] = [];

    try {
        project = await getProject(id);
        if (!project) {
            notFound();
        }
    } catch {
        notFound();
    }

    clients = await getClients();
    if (!clients) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="flex justify-between items-center">
                    <div className="flex flex-col justify-between mb-2">
                        <h1 className="text-2xl font-bold">{project.title}</h1>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon-lg" variant="secondary">
                            <StarIcon className="size-3" />
                        </Button>
                        <EditProjectDialog project={project} clients={clients} editProject={handleUpdateProject} />
                        <DeleteProjectButton id={id} deleteProject={handleDeleteProject} />
                    </div>
                </div>
                <div className="flex gap-1 items-center mb-2">
                    <Badge variant="outline" className="capitalize">{project.status.replace("_", " ")}</Badge>
                    <span className="mx-1 text-muted-foreground">&middot;</span>
                    <span className="text-sm text-muted-foreground flex gap-2">
                        <span className="inline-block uppercase text-xs font-medium">Progress:</span>
                        <span className="inline-block text-xs font-medium">{project.progress}%</span>
                    </span>
                    <span className="mx-1 text-muted-foreground">&middot;</span>
                    <span className="text-sm text-muted-foreground flex gap-2">
                        <span className="inline-block uppercase text-xs font-medium">Value:</span>
                        <span className="inline-block text-xs font-medium">{Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(project.value)}</span>
                    </span>
                    <span className="mx-1 text-muted-foreground">&middot;</span>
                    <span className="text-sm text-muted-foreground flex gap-2">
                        <span className="inline-block uppercase text-xs font-medium">Start Date:</span>
                        <span className="inline-block text-xs font-medium">{formatDate(project.start_date, "MMM d, yyyy")}</span>
                    </span>
                    <span className="mx-1 text-muted-foreground">&middot;</span>
                    <span className="text-sm text-muted-foreground flex gap-2">
                        <span className="inline-block uppercase text-xs font-medium">Due Date:</span>
                        <span className="inline-block text-xs font-medium">{formatDate(project.due_date, "MMM d, yyyy")}</span>
                    </span>
                </div>
                <Progress value={project.progress} />
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
                    <ProjectOverview project={project} client={project.client_id ? clients.find((client) => client.id === project.client_id) ?? null : null} />
                </TabsContent>
                <TabsContent value="tasks">
                    <div>Tasks</div>
                </TabsContent>
                <TabsContent value="time">
                    <div>Time</div>
                </TabsContent>
                <TabsContent value="files">
                    <div>Files</div>
                </TabsContent>
                <TabsContent value="invoices">
                    <div>Invoices</div>
                </TabsContent>
                <TabsContent value="notes">
                    <div>Notes</div>
                </TabsContent>
            </Tabs>
        </div >
    )
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Project params={params} />
        </Suspense>
    );
}