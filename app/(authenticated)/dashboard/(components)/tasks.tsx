import { getProjects } from "@/lib/actions/projects";
import { getTasks } from "@/lib/actions/tasks";
import { format, differenceInDays } from "date-fns";
import { FlagSolidIcon, FlagOutlineIcon } from "./icons";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";

export async function Tasks({ userId }: { userId: string }) {
    const tasks = await getTasks(userId);
    const projects = await getProjects(userId);
    if (!tasks) {
        return <div>No tasks found</div>;
    }
    return (
        <div className="flex flex-col gap-2">
            {tasks.map((task) => (
                <>
                    <div key={task.id} className="group relative flex items-center gap-2">
                        <div className="absolute -inset-x-1.5 -inset-y-1 rounded-lg transition-colors group-hover:bg-muted/50 pointer-events-none" />
                        <Link href={`projects/${task.project_id}`} className="absolute -inset-x-1.5 -inset-y-1 rounded-lg z-20" aria-label={task.title} />
                        <div className={cn("relative z-10 rounded-lg bg-muted p-3 w-fit", task.priority === "high" ? "bg-destructive/10" : "bg-muted")}>
                            {task.priority === "high" ? <FlagSolidIcon className="w-4 h-4 text-destructive" />
                                : task.priority === "medium" ? <FlagSolidIcon className="w-4 h-4 text-muted-foreground" />
                                    : <FlagOutlineIcon className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="relative z-10 flex justify-between w-full">
                            <div className="flex flex-col">
                                <Typography variant="body">{task.title}</Typography>
                                <Typography variant="bodySmall" color="muted">{projects.find((project) => project.id === task.project_id)?.title}</Typography>
                            </div>
                            <div className="flex flex-col items-end">
                                <Typography variant="bodySmall" color="muted">Due: {format(new Date(task.due_date), "MMM d, yyyy")}</Typography>
                                <Typography variant="bodySmall" color="destructive">{task.is_overdue && `${differenceInDays(new Date(), new Date(task.due_date))} ${differenceInDays(new Date(), new Date(task.due_date)) === 1 ? "day" : "days"} overdue`}</Typography>
                            </div>
                        </div>

                    </div>

                </>
            ))}
        </div>
    )
}