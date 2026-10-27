import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getRecentActivity, type ActivityItem } from "@/lib/dashboard/recent-activity";
import type { DashboardCoreData } from "@/lib/data/dashboard";
import { FileTextIcon, FolderKanbanIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { FlagOutlineIcon } from "./icons";

interface RecentActivityProps {
    coreData: DashboardCoreData;
    locale: string;
}

const ICONS: Record<ActivityItem["type"], React.ReactNode> = {
    invoice: <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />,
    project: <FolderKanbanIcon className="size-4 shrink-0 text-muted-foreground" />,
    client: <UsersIcon className="size-4 shrink-0 text-muted-foreground" />,
    task: <FlagOutlineIcon className="size-4 shrink-0 text-muted-foreground" />
}

export function RecentActivity({ coreData, locale }: RecentActivityProps) {
    const activity = getRecentActivity(coreData, 15);
    const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
    const dateOnly = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="h2">Recent activity</Typography></CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto" tabIndex={0} aria-label="Recent activity list">
                {activity.length > 0 ? (
                    <ul className="p-2">
                        {activity.map((item) => (
                            <li key={item.id}>
                                <Link href={item.href} className="flex justify-between items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-muted/50">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex items-center gap-2 bg-muted rounded-lg p-3" aria-hidden>
                                            {ICONS[item.type]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <Typography variant="body" as="span">{item.text}</Typography>
                                            {item.projectTitle && (
                                                <Typography variant="bodySmall" color="muted" as="span">
                                                    {item.projectTitle}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <Typography variant="metadata" as="span" className="shrink-0 text-right">
                                        {item.dateOnly
                                            ? dateOnly.format(new Date(`${item.timestamp.slice(0, 10)}T00:00:00Z`))
                                            : dateTime.format(new Date(item.timestamp))}
                                    </Typography>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-5">
                        <Typography variant="body" color="muted" as="span">Payments, finished tasks and new work will show up here.</Typography>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
