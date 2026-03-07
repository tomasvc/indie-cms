import { format, differenceInDays } from "date-fns";
import { Typography } from "@/components/ui/typography";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export async function UpcomingDeadlines({ upcomingDeadlines }: { upcomingDeadlines: Task[] }) {
    if (!upcomingDeadlines) {
        return <Typography variant="body" color="muted" as="p">No upcoming deadlines</Typography>;
    }
    return (
        <div className="flex flex-col gap-2">
            {upcomingDeadlines.map((item) => (
                <>
                    <div className="group relative flex justify-between" key={item.id}>
                        <div className="absolute -inset-x-1.5 -inset-y-1 rounded-lg transition-colors group-hover:bg-muted/50 pointer-events-none" />
                        <Link href={`projects/${item.project_id}`} className="absolute -inset-x-1.5 -inset-y-1 rounded-lg z-20" aria-label={item.title} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2">
                                <Typography variant="body" as="p">{item.title}</Typography>
                                <Badge variant="secondary" className="capitalize">{item.parent_task_id !== null && "Task"}</Badge>
                            </div>
                            <Typography variant="bodySmall" color="muted" as="span">Placeholder</Typography>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                            <Typography variant="bodySmall" color="muted" as="span">
                                Due: {format(new Date(item.due_date), "MMM d, yyyy")}
                            </Typography>
                            <Typography variant="bodySmall" color="destructive" as="span">
                                {(() => {
                                    const diff = differenceInDays(new Date(item.due_date), new Date());
                                    if (diff > 1) {
                                        return `${diff} days left`;
                                    } else if (diff === 1) {
                                        return "1 day left";
                                    } else if (diff === 0) {
                                        return "Due today";
                                    } else if (diff === -1) {
                                        return "1 day overdue";
                                    } else if (diff < -1) {
                                        return `${Math.abs(diff)} days overdue`;
                                    } else {
                                        return "—";
                                    }
                                })()}
                            </Typography>
                        </div>
                    </div>
                </>
            ))}
        </div>
    );
}