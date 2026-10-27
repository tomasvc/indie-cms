import type { DashboardCoreData } from "@/lib/data/dashboard";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { CalendarIcon, FolderKanbanIcon } from "lucide-react";
import { getActiveProjects, getUpcomingDeadlines } from "@/lib/dashboard/workload";
import { Project, Task } from "@/types";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { todayISO } from "@/lib/money";

type WorkloadProps = {
    data: DashboardCoreData;
    locale: string;
};

export function Workload({ data, locale }: WorkloadProps) {
    const today = todayISO();
    const projectTitle = new Map(data.projects.map((project) => [project.id, project.title]));
    const activeProjects = getActiveProjects(data.projects as Array<Project>);
    const upcomingDeadlines = getUpcomingDeadlines(data.tasks as unknown as Array<Task>, today).map((task) => ({
        id: task.id,
        title: task.title,
        project_id: task.project_id,
        projectTitle: projectTitle.get(task.project_id) ?? "Project",
        due_date: task.due_date,
    }));

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="h2">Coming up</Typography></CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
                <div className="flex flex-col pb-2">
                    <div className="flex items-center gap-2 pb-2">
                        <FolderKanbanIcon className="w-3 h-3 text-muted-foreground" aria-hidden />
                        <Typography variant="cardSectionTitle" as="h3">Active projects</Typography>
                    </div>
                    <div className="flex flex-col gap-1">
                        {activeProjects.length > 0 ? activeProjects.map((project) => (
                            project.id === "others" ? (
                                <Link key="others" href="/projects" className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                                    {"count" in project ? `${project.count} more active ${project.count === 1 ? "project" : "projects"}` : "More projects"}
                                </Link>
                            ) : (
                            <div className="flex flex-col gap-1.5 pb-2" key={project.id}>
                                <div className="flex items-center justify-between gap-3">
                                    <Link href={`/projects/${project.id}`} className="min-w-0 truncate rounded-sm hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <Typography variant="body" as="span" className="font-medium">{project.title}</Typography>
                                    </Link>
                                    <span className="flex shrink-0 items-center gap-2">
                                        <Typography variant="metadata" as="span">{Math.round(project.progress)}%</Typography>
                                        <ProjectStatusBadge status={project.status} />
                                    </span>
                                </div>
                                <Progress color="primary" value={project.progress} aria-label={`${project.title} progress`} />
                            </div>
                            )
                        )) : (
                            <Typography variant="body" color="muted" as="p">No active projects</Typography>
                        )}
                    </div>
                </div>
                <div className="pt-4">
                    <div className="flex items-center gap-2 pb-2">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" aria-hidden />
                        <Typography variant="cardSectionTitle" as="h3">Task deadlines, next 14 days</Typography>
                    </div>
                    <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} locale={locale} />
                </div>
            </CardContent>
        </Card>
    )
}