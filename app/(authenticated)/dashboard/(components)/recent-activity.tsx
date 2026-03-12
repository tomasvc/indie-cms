import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getRecentActivity, type ActivityItem } from "@/lib/dashboard/recent-activity";
import { DashboardCoreData } from "@/lib/queries/dashboard";
import { FileTextIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { FolderKanbanIcon, UsersIcon, BriefcaseBusinessIcon } from "lucide-react";
import { FlagOutlineIcon } from "./icons";

interface RecentActivityProps {
    coreData: DashboardCoreData;
}

const ACTION_PHRASES: Record<ActivityItem["action"], string> = {
    "missed contact": "missesd its contact date",
    completed: "been completed",
    updated: "been updated",
    created: "been created"
}

const ICONS: Record<ActivityItem["type"], React.ReactNode> = {
    invoice: <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />,
    project: <FolderKanbanIcon className="size-4 shrink-0 text-muted-foreground" />,
    client: <UsersIcon className="size-4 shrink-0 text-muted-foreground" />,
    task: <FlagOutlineIcon className="size-4 shrink-0 text-muted-foreground" />
}

export async function RecentActivity({ coreData }: RecentActivityProps) {

    const activity = getRecentActivity(coreData, 15)

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Recent Activity</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your recent activity.</Typography></CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto">
                {activity.length > 0 ? (
                    <ul className="p-2">
                        {activity.map((item) => (
                            <li key={item.id}>
                                <Link href={item.href ?? ""} className="flex justify-between items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                                            {ICONS[item.type] || <BriefcaseBusinessIcon className="size-4 shrink-0 text-muted-foreground" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <Typography
                                                variant="body"
                                                as="span"
                                                className="flex-1"
                                            >
                                                {`${item.title} has ${ACTION_PHRASES[item.action]}`}
                                            </Typography>
                                            {item.projectTitle && (
                                                <Typography variant="bodySmall" color="muted" as="span">
                                                    {item.projectTitle}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <Typography variant="metadata" as="span">
                                        {format(new Date(item.timestamp), "MMM d yyyy 'at' hh:mm a")}
                                    </Typography>

                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-5">
                        <Typography variant="body" color="muted" as="span">No recent activity</Typography>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}