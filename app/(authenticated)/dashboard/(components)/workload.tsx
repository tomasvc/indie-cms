import type { DashboardCoreData } from "@/lib/data/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { AlertTriangleIcon, CalendarIcon, FolderKanbanIcon } from "lucide-react";
import { getActiveProjects, getOverdueTasks, getUpcomingDeadlines } from "@/lib/dashboard/workload";
import { Project, Task } from "@/types";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { daysBetween, todayISO } from "@/lib/money";
import { formatDate } from "@/lib/helpers/format";
import { FlagOutlineIcon, FlagSolidIcon } from "./icons";
import { cn } from "@/lib/utils";

type WorkloadProps = {
    data: DashboardCoreData;
};

export function Workload({ data }: WorkloadProps) {
    const today = todayISO();
    const projectTitle = new Map(data.projects.map((project) => [project.id, project.title]));
    const activeProjects = getActiveProjects(data.projects as Array<Project>);
    const overdueTasks = getOverdueTasks(data.tasks as unknown as Array<Task>, today);
    const upcomingDeadlines = getUpcomingDeadlines(data.tasks as unknown as Array<Task>, today).map((task) => ({
        id: task.id,
        title: task.title,
        project_id: task.project_id,
        projectTitle: projectTitle.get(task.project_id) ?? "Project",
        due_date: task.due_date,
    }));

    return (
        <Card className="col-span-2">
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Workload</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your workload.</Typography></CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
                <div className="flex flex-col pb-2">
                    <div className="flex items-center gap-2 pb-2">
                        <FolderKanbanIcon className="w-3 h-3 text-muted-foreground" />
                        <Typography variant="cardSectionTitle" as="span">Active projects</Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        {activeProjects.length > 0 ? activeProjects.map((project) => (
                            <div className="flex flex-col gap-1 pb-2" key={project.id}>
                                <div className="flex justify-between">
                                    <Link href={project.id === "others" ? "/projects" : `/projects/${project.id}`} className="hover:opacity-80 transition-opacity">
                                        <Typography variant="body" as="p">
                                            {project.title}
                                            {project.id === "others" && "count" in project && project.count != null
                                                ? ` (${project.count})`
                                                : ""}
                                        </Typography>
                                    </Link>
                                    <p className="flex items-center gap-2">
                                        <Typography variant="metadata" as="span">{project.progress}%</Typography>
                                        {project.priority && (
                                            <Badge variant="secondary" className="capitalize">{project.priority}</Badge>
                                        )}
                                        <Badge variant="secondary" className="capitalize">{project.status}</Badge>
                                    </p>
                                </div>
                                <Progress color="primary" value={project.progress} />
                            </div>
                        )) : (
                            <Typography variant="body" color="muted" as="p">No active projects</Typography>
                        )}
                    </div>
                </div>
                <div className="py-4">
                    <div className="flex items-center gap-2 pb-2">
                        <AlertTriangleIcon className="w-3 h-3 text-muted-foreground" />
                        <Typography variant="cardSectionTitle" as="span">Overdue tasks</Typography>
                    </div>
                    <div className="flex flex-col gap-2">
                        {overdueTasks.length > 0 ? overdueTasks.map((task) => {
                            const days = Math.abs(daysBetween(task.due_date, today));
                            return (
                                <div key={task.id} className="group relative flex items-center gap-2">
                                    <div className="absolute -inset-x-1.5 -inset-y-1 rounded-lg transition-colors group-hover:bg-muted/50 pointer-events-none" />
                                    <Link href={`/projects/${task.project_id}`} className="absolute -inset-x-1.5 -inset-y-1 rounded-lg z-20" aria-label={task.title} />
                                    <div className={cn("relative z-10 rounded-lg p-3 w-fit", task.priority === "high" ? "bg-destructive/10" : "bg-muted")}>
                                        {task.priority === "high" ? <FlagSolidIcon className="w-4 h-4 text-destructive" />
                                            : task.priority === "medium" ? <FlagSolidIcon className="w-4 h-4 text-muted-foreground" />
                                                : <FlagOutlineIcon className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                    <div className="relative z-10 flex justify-between w-full">
                                        <div className="flex flex-col">
                                            <Typography variant="body" as="p">{task.title}</Typography>
                                            <Typography variant="bodySmall" color="muted" as="span">
                                                {projectTitle.get(task.project_id) ?? "Project"}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <Typography variant="bodySmall" color="muted" as="span">
                                                Due: {formatDate(task.due_date, "MMM d, yyyy")}
                                            </Typography>
                                            <Typography variant="bodySmall" color="destructive" as="span">
                                                {days === 1 ? "1 day overdue" : `${days} days overdue`}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <Typography variant="body" color="muted" as="p">No overdue tasks</Typography>
                        )}
                    </div>
                </div>
                <div className="pt-4">
                    <div className="flex items-center gap-2 pb-2">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                        <Typography variant="cardSectionTitle" as="span">Upcoming deadlines</Typography>
                    </div>
                    <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />
                </div>
            </CardContent>
        </Card>
    )
}