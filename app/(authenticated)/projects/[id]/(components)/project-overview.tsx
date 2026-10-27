import Link from "next/link";
import { differenceInDays, isValid, parseISO } from "date-fns";
import { ClockIcon, FileUpIcon, MailIcon, PhoneIcon, PlusIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { clientLabel } from "@/lib/helpers/clients";
import { formatDate, formatMoney, relativeDays } from "@/lib/helpers/format";
import { isTaskDone, isTaskOverdue } from "@/lib/helpers/tasks";
import { cn } from "@/lib/utils";
import type { Client, Project, Task } from "@/types";

export type SparklineDayEntry = {
    description?: string | null;
    hours: number;
    rate: number;
    billable: boolean;
};

export type SparklineDay = {
    dateLabel: string;
    hours: number;
    entries: SparklineDayEntry[];
};

const NEXT_UP_LIMIT = 4;

type ProjectOverviewProps = {
    project: Project;
    client: Client | null;
    tasks?: Task[];
    unbilledAmount?: number;
    /** Billable time already logged, hours × rate. */
    spent?: number;
    /** All logged hours, including non-billable. */
    loggedHours?: number;
    sparklineData?: SparklineDay[];
};

/**
 * "Is this job healthy, and what's next?" in four blocks: a summary strip, the next tasks,
 * time, and the project's details. Everything else lives on its own tab.
 */
export function ProjectOverview({
    project,
    client,
    tasks = [],
    unbilledAmount = 0,
    spent = 0,
    loggedHours = 0,
    sparklineData = [],
}: ProjectOverviewProps) {
    const currency = project.currency;
    const money = (amount: number) => formatMoney(amount, currency);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = project.start_date ? parseISO(project.start_date) : null;
    const due = project.due_date ? parseISO(project.due_date) : null;
    const daysLeft = due && isValid(due) ? differenceInDays(due, today) : null;
    const totalDays = start && due && isValid(start) && isValid(due) ? Math.max(1, differenceInDays(due, start)) : 0;
    const elapsedDays = start && isValid(start) ? differenceInDays(today, start) : 0;
    const timeElapsedPct = totalDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;

    // On track when the work done keeps pace with the time used
    const isOnTrack = daysLeft === null || totalDays === 0 || project.progress >= Math.round(timeElapsedPct) - 10;
    const doneTasks = tasks.filter(isTaskDone).length;
    const openTasks = tasks
        .filter((task) => !isTaskDone(task))
        .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));

    const fee = Number(project.value ?? 0);
    const margin = fee > 0 ? Math.round(((fee - spent) / fee) * 100) : null;
    const budget = Number(project.budget ?? 0);
    const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : null;
    const isHourly = project.billing_type === "hourly";

    const dueText =
        daysLeft === null ? "No due date"
            : daysLeft < 0 ? `${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "day" : "days"} overdue`
                : daysLeft === 0 ? "Due today"
                    : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;

    const lastWeekHours = sparklineData.reduce((sum, day) => sum + day.hours, 0);
    const maxDayHours = Math.max(1, ...sparklineData.map((day) => day.hours));

    return (
        <div className="flex flex-col gap-4">
            {/* Summary strip */}
            <Card className="grid grid-cols-2 gap-0 p-0 lg:grid-cols-4">
                <SummaryCell label="Progress" className="border-b lg:border-b-0">
                    <Typography variant="kpiValue" as="p">{Math.round(project.progress)}%</Typography>
                    <Meter value={project.progress} tone={isOnTrack ? "success" : "warning"} />
                    <Typography variant="kpiSub" as="p">
                        <span className={isOnTrack ? "text-success" : "text-warning"}>{isOnTrack ? "On track" : "Behind schedule"}</span>
                        {tasks.length > 0 && ` · ${doneTasks} of ${tasks.length} tasks done`}
                    </Typography>
                </SummaryCell>
                <SummaryCell label={isHourly ? "Hourly rate" : "Fee"} className="border-b border-l lg:border-b-0">
                    <Typography variant="kpiValue" as="p">
                        {isHourly ? `${money(Number(project.hourly_rate ?? 0))}/h` : money(fee)}
                    </Typography>
                    <Typography variant="kpiSub" as="p">
                        {isHourly
                            ? fee > 0 ? `About ${money(fee)} in total` : "Billed by the hour"
                            : margin === null ? "No fee set" : `${margin}% left after time spent`}
                    </Typography>
                </SummaryCell>
                <SummaryCell label="Budget used" className="lg:border-l">
                    <Typography variant="kpiValue" as="p">{budgetPct === null ? money(spent) : `${budgetPct}%`}</Typography>
                    {budgetPct !== null && <Meter value={budgetPct} tone={budgetPct > 100 ? "destructive" : budgetPct > 85 ? "warning" : "success"} />}
                    <Typography variant="kpiSub" as="p">
                        {budget > 0 ? `${money(spent)} of ${money(budget)}` : "No budget set"}
                    </Typography>
                </SummaryCell>
                <SummaryCell label="Due" className="border-l">
                    <Typography variant="kpiValue" as="p">{project.due_date ? formatDate(project.due_date, "d MMM") : "—"}</Typography>
                    <Typography variant="kpiSub" as="p" className={cn(daysLeft !== null && daysLeft < 0 && "text-destructive", daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && "text-warning")}>
                        {dueText}
                    </Typography>
                </SummaryCell>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="flex flex-col gap-4 lg:col-span-2">
                    {/* Next up */}
                    <Card className="gap-0">
                        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
                            <CardTitle>Next up</CardTitle>
                            {openTasks.length > NEXT_UP_LIMIT && (
                                <Link href={`/projects/${project.id}?tab=tasks`} className="text-[13px] text-muted-foreground underline-offset-4 hover:underline">
                                    All {openTasks.length} open tasks
                                </Link>
                            )}
                        </CardHeader>
                        <CardContent className="py-2">
                            {openTasks.length > 0 ? (
                                <ul className="divide-y">
                                    {openTasks.slice(0, NEXT_UP_LIMIT).map((task) => {
                                        const overdue = isTaskOverdue(task);
                                        return (
                                            <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                                                <Typography variant="body" as="span" className="min-w-0 truncate">{task.title}</Typography>
                                                <Typography variant="bodySmall" as="span" className={cn("shrink-0", overdue ? "text-destructive" : "text-muted-foreground")}>
                                                    {task.due_date ? `${overdue ? "Overdue · " : "Due "}${formatDate(task.due_date, "d MMM")}` : "No due date"}
                                                </Typography>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <Typography variant="body" color="muted" as="p" className="py-3">
                                    {tasks.length > 0 ? "All tasks are done." : "No tasks yet. Add the first step of the work."}
                                </Typography>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-2 border-t">
                            <Button asChild size="sm">
                                <Link href={`/projects/${project.id}?tab=tasks`}><PlusIcon aria-hidden />Add task</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/projects/${project.id}?tab=time`}><ClockIcon aria-hidden />Log time</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/invoices/new?project=${project.id}${unbilledAmount > 0 ? "&time=unbilled" : ""}`}>
                                    <FileUpIcon aria-hidden />
                                    {unbilledAmount > 0 ? `Invoice ${money(unbilledAmount)} of time` : "Create invoice"}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Time */}
                    <Card className="gap-0">
                        <CardHeader className="border-b"><CardTitle>Time</CardTitle></CardHeader>
                        <CardContent className="grid gap-5 py-4 sm:grid-cols-[1fr_1fr_1.4fr]">
                            <div>
                                <Typography variant="kpiLabel" as="p">Logged</Typography>
                                <Typography variant="metricValue" as="p">{loggedHours.toFixed(1)} h</Typography>
                                <Typography variant="kpiSub" as="p">
                                    {project.estimated_hours > 0 ? `of ${project.estimated_hours} h estimated` : "No estimate"}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="kpiLabel" as="p">Not yet invoiced</Typography>
                                <Typography variant="metricValue" as="p">{money(unbilledAmount)}</Typography>
                                <Typography variant="kpiSub" as="p">billable time</Typography>
                            </div>
                            <div>
                                <Typography variant="kpiLabel" as="p">Last 7 days · {lastWeekHours.toFixed(1)} h</Typography>
                                <div className="mt-2 flex h-10 items-end gap-1" aria-hidden>
                                    {sparklineData.map((day, index) => (
                                        <Tooltip key={index}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn("min-w-2 flex-1 rounded-sm", day.hours > 0 ? "bg-primary/70" : "bg-muted")}
                                                    style={{ height: `${4 + (day.hours / maxDayHours) * 36}px` }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-60">
                                                <p className="font-medium">{day.dateLabel} · {day.hours.toFixed(1)} h</p>
                                                {day.entries.map((entry, entryIndex) => (
                                                    <p key={entryIndex} className="opacity-90">{entry.description || "Time entry"} · {entry.hours.toFixed(1)} h</p>
                                                ))}
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details */}
                <Card className="h-fit gap-0">
                    <CardHeader className="border-b"><CardTitle>Details</CardTitle></CardHeader>
                    <CardContent className="flex flex-col gap-5 py-4">
                        <section>
                            <Typography variant="kpiLabel" as="h3" className="mb-1">Client</Typography>
                            {client ? (
                                <>
                                    <Link href={`/clients/${client.id}`} className="text-[15px] font-semibold text-foreground underline-offset-4 hover:underline">
                                        {clientLabel(client)}
                                    </Link>
                                    {client.last_contact && (
                                        <Typography variant="bodySmall" color="muted" as="p">Last contact {relativeDays(client.last_contact)}</Typography>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {client.email && (
                                            <Button asChild size="sm" variant="outline">
                                                <a href={`mailto:${client.email}`}><MailIcon aria-hidden />Email</a>
                                            </Button>
                                        )}
                                        {client.phone && (
                                            <Button asChild size="sm" variant="outline">
                                                <a href={`tel:${client.phone}`}><PhoneIcon aria-hidden />Call</a>
                                            </Button>
                                        )}
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={`/clients/${client.id}`}><UserIcon aria-hidden />History</Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Typography variant="body" color="muted" as="p">No client linked</Typography>
                            )}
                        </section>

                        <section>
                            <Typography variant="kpiLabel" as="h3" className="mb-2">Timeline</Typography>
                            {totalDays > 0 ? (
                                <>
                                    <div className="relative h-2 w-full rounded-full bg-muted">
                                        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/60" style={{ width: `${timeElapsedPct}%` }} />
                                    </div>
                                    <div className="mt-1.5 flex justify-between">
                                        <Typography variant="metadata" as="span">{formatDate(project.start_date, "d MMM")}</Typography>
                                        <Typography variant="metadata" as="span">{formatDate(project.due_date, "d MMM")}</Typography>
                                    </div>
                                    <Typography variant="bodySmall" as="p" className="mt-1">
                                        {Math.round(timeElapsedPct)}% of the time used · {dueText.toLowerCase()}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body" color="muted" as="p">Add start and due dates to see the timeline.</Typography>
                            )}
                        </section>

                        {(project.category || (project.tags?.length ?? 0) > 0) && (
                            <section>
                                <Typography variant="kpiLabel" as="h3" className="mb-2">Category & tags</Typography>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.category && (
                                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[13px] font-medium text-foreground">{project.category}</span>
                                    )}
                                    {project.tags?.map((tag) => (
                                        <span key={tag.id} className="rounded-full border px-2.5 py-0.5 text-[13px] text-foreground">{tag.name}</span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCell({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-1 p-5", className)}>
            <Typography variant="kpiLabel" as="p">{label}</Typography>
            {children}
        </div>
    );
}

const METER_TONE = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
} as const;

function Meter({ value, tone }: { value: number; tone: keyof typeof METER_TONE }) {
    return (
        <div className="my-1 h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className={cn("h-full rounded-full", METER_TONE[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        </div>
    );
}
