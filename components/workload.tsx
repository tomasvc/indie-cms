import { DashboardCoreData } from "@/lib/queries/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangleIcon, CalendarIcon, FolderKanbanIcon } from "lucide-react";
import { getActiveProjects, getOverdueTasks, getUpcomingDeadlines } from "@/lib/dashboard/workload";
import { Project, Task } from "@/types";
import { Progress } from "./ui/progress";
import { format } from "date-fns";

type WorkloadProps = {
    data: DashboardCoreData;
};

export function Workload({ data }: WorkloadProps) {
    const activeProjects = getActiveProjects(data.projects as Array<Project>);
    const overdueTasks = getOverdueTasks(data.tasks as Array<Task>);
    const upcomingDeadlines = getUpcomingDeadlines(data.tasks as Array<Task>);
    return (
        <Card className="col-span-2">
            <CardHeader className="border-b">
                <CardTitle>Workload</CardTitle>
                <CardDescription>This is a summary of your workload.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
                <div className="flex flex-col pb-2">
                    <div className="flex items-center gap-2 pb-2">
                        <FolderKanbanIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                            Active projects
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {activeProjects.length > 0 ? activeProjects.map((project) => (
                            <div className="flex flex-col gap-1 pb-2" key={project.id}>
                                <div className="flex justify-between">
                                    <p>
                                        {project.title}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                                        <Badge variant="secondary" className="text-xs capitalize">{project.status}</Badge>
                                    </p>
                                </div>
                                <Progress color="primary" value={project.progress} />
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No active projects</p>
                        )}
                    </div>
                </div>
                <div className="py-4">
                    <div className="flex items-center gap-2 pb-2">
                        <AlertTriangleIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                            Overdue tasks
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {overdueTasks.length > 0 ? overdueTasks.map((task) => (
                            <div className="flex flex-col gap-1 pb-2" key={task.id}>
                                <p>{task.title}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No overdue tasks</p>
                        )}
                    </div>
                </div>
                <div className="pt-4">
                    <div className="flex items-center gap-2 pb-2">
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                            Upcoming deadlines
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((task) => (
                            <div className="flex justify-between pb-2" key={task.id}>
                                <p>{task.title}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(task.due_date), "MMM d, yyyy")}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}