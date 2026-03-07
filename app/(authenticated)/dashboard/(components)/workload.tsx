import { DashboardCoreData } from "@/lib/queries/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { AlertTriangleIcon, CalendarIcon, FolderKanbanIcon } from "lucide-react";
import { getActiveProjects, getOverdueTasks, getUpcomingDeadlines } from "@/lib/dashboard/workload";
import { Project, Task } from "@/types";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Tasks } from "./tasks";
import { UpcomingDeadlines } from "./upcoming-deadlines";

type WorkloadProps = {
    data: DashboardCoreData;
    userId: string;
};

export function Workload({ data, userId }: WorkloadProps) {
    const activeProjects = getActiveProjects(data.projects as Array<Project>);
    const overdueTasks = getOverdueTasks(data.tasks as unknown as Array<Task>);
    const upcomingDeadlines = getUpcomingDeadlines(data.tasks as unknown as Array<Task>);

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
                    <div className="flex flex-col gap-1">
                        {overdueTasks.length > 0 ?
                            <Tasks userId={userId} />
                            : (
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