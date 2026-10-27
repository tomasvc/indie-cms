import { Typography } from "@/components/ui/typography";
import { formatLocalDate } from "@/lib/helpers/format";
import { daysBetween, todayISO } from "@/lib/money";
import Link from "next/link";

type Deadline = {
    id: string;
    title: string;
    project_id: string;
    projectTitle: string;
    due_date: string;
};

export function UpcomingDeadlines({ upcomingDeadlines, locale }: { upcomingDeadlines: Deadline[]; locale: string }) {
    const today = todayISO();

    if (upcomingDeadlines.length === 0) {
        return <Typography variant="body" color="muted" as="p">No upcoming deadlines</Typography>;
    }

    return (
        <div className="flex flex-col gap-2">
            {upcomingDeadlines.map((item) => {
                const daysLeft = daysBetween(item.due_date, today);
                const when = daysLeft === 0 ? "Due today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
                return (
                    <div key={item.id} className="group relative flex justify-between">
                        <div className="absolute -inset-x-2.5 -inset-y-1 rounded-lg transition-colors group-hover:bg-muted/50 group-has-[:focus-visible]:bg-muted/50 pointer-events-none" />
                        <Link
                            href={item.project_id ? `/projects/${item.project_id}` : "/projects"}
                            className="absolute -inset-x-2.5 -inset-y-1 rounded-lg z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`${item.title}, ${item.projectTitle}, ${when.toLowerCase()}`}
                        />
                        <div className="relative z-10">
                            <Typography variant="body" as="p">{item.title}</Typography>
                            <Typography variant="bodySmall" color="muted" as="span">{item.projectTitle}</Typography>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                            <Typography variant="bodySmall" as="span" className="font-medium">{when}</Typography>
                            <Typography variant="bodySmall" color="muted" as="span">
                                Due {formatLocalDate(item.due_date, locale)}
                            </Typography>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
