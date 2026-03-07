import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { Client, Project } from "@/types";
import {
    CalendarIcon,
    ClockIcon,
    DollarSignIcon,
    FileTextIcon,
    MailIcon,
    PhoneIcon,
    TagIcon,
    UserIcon,
    ArrowRightIcon,
    MonitorIcon,
    ActivityIcon,
    PlusIcon,
    FileUpIcon,
} from "lucide-react";
import { isValid, parseISO, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { formatMoney, formatDate, relativeDays } from "@/lib/helpers/format";

function CircularProgress({ value, size = 64 }: { value: number; size?: number }) {
    const stroke = 6;
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                className="text-muted"
            />
            <circle
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-primary transition-[stroke-dashoffset]"
            />
        </svg>
    );
}

export type RecentActivityItem = {
    id: string;
    type: "invoice" | "task" | "time" | "file";
    title: string;
    date: string;
};

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

export function ProjectOverview({
    project,
    client,
    recentActivity = [],
    unbilledAmount = 0,
    sparklineHours = [],
    sparklineData,
}: {
    project: Project;
    client: Client | null;
    recentActivity?: RecentActivityItem[];
    unbilledAmount?: number;
    sparklineHours?: number[];
    sparklineData?: SparklineDay[];
}) {
    const currency = project.currency || "USD";
    const dueDate = project.due_date ? parseISO(project.due_date) : null;
    const startDate = project.start_date ? parseISO(project.start_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysLeft =
        dueDate && isValid(dueDate)
            ? Math.max(0, differenceInDays(dueDate, today))
            : null;
    const daysLeftColor =
        daysLeft === null
            ? "text-muted-foreground"
            : daysLeft > 14
                ? "text-primary"
                : daysLeft >= 7
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-destructive";

    const isOnTrack =
        daysLeft === null ||
        project.progress >=
        (startDate && dueDate && isValid(startDate) && isValid(dueDate)
            ? Math.min(
                100,
                Math.round(
                    (differenceInDays(today, startDate) /
                        Math.max(1, differenceInDays(dueDate, startDate))) *
                    100
                )
            )
            : 0);
    const progressLabel = isOnTrack ? "On track" : "At risk";

    const valueLockedGreen = (project.profit_margin ?? 0) > 30;
    const budgetUsed = project.value ?? 0;
    const budgetTotal = project.budget ?? 0;
    const remainingBudget =
        budgetTotal > 0 ? Math.max(0, budgetTotal - budgetUsed) : null;

    const estimatedH = project.estimated_hours ?? 0;
    const actualH = project.actual_hours ?? 0;
    const hasTime = actualH > 0;
    const burnRateDays = 7;
    const hoursArray = sparklineData?.map((d) => d.hours) ?? sparklineHours;
    const burnRate =
        hasTime && hoursArray.length > 0
            ? hoursArray.reduce((a, b) => a + b, 0) / burnRateDays
            : null;

    const totalDays =
        startDate && dueDate && isValid(startDate) && isValid(dueDate)
            ? differenceInDays(dueDate, startDate)
            : 0;
    const elapsedDays =
        startDate && isValid(startDate)
            ? differenceInDays(today, startDate)
            : 0;
    const timelineProgress =
        totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 px-4 py-5">
                        <div className="flex size-14 shrink-0 items-center justify-center text-primary">
                            <CircularProgress value={project.progress} size={56} />
                        </div>
                        <div className="min-w-0">
                            <Typography variant="overline" as="p">Progress</Typography>
                            <Typography variant="kpiValue" as="p">{project.progress}%</Typography>
                            <Typography
                                variant="badgeSmall"
                                as="p"
                                className={cn(
                                    "mt-0.5",
                                    isOnTrack ? "text-primary" : "text-amber-600 dark:text-amber-500"
                                )}
                            >
                                {progressLabel}
                            </Typography>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 px-4 py-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <DollarSignIcon className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <Typography variant="overline" as="p">Value</Typography>
                            <Typography
                                variant="kpiValue"
                                as="p"
                                className={cn("tabular-nums", valueLockedGreen && "text-primary")}
                            >
                                {formatMoney(project.value ?? 0, currency)}
                            </Typography>
                            <Typography variant="kpiSub" as="p">
                                Margin: {project.profit_margin ?? 0}%
                            </Typography>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 px-4 py-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
                            <MonitorIcon className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <Typography variant="overline" as="p">Budget used</Typography>
                            <Typography variant="kpiValue" as="p" className="tabular-nums">
                                {formatMoney(budgetUsed, currency)}
                            </Typography>
                            <div className="flex items-center gap-2">
                                <Typography variant="kpiSub" as="p">
                                    of {budgetTotal > 0 ? formatMoney(budgetTotal, currency) : "—"}
                                </Typography>
                                {remainingBudget !== null && (
                                    <Typography variant="kpiSub" as="p">
                                        / {formatMoney(remainingBudget, currency)} remaining
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardContent className="flex items-center gap-4 px-4 py-5">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <CalendarIcon className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <Typography variant="overline" as="p">Days left</Typography>
                            <Typography variant="kpiValue" as="p" className={cn("tabular-nums", daysLeftColor)}>
                                {daysLeft !== null ? `${daysLeft}d` : "—"}
                            </Typography>
                            <Typography variant="kpiSub" as="p">
                                Due {formatDate(project.due_date, "MMM d")}
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_1fr] xl:grid-cols-[3fr_2fr]">
                <div className="flex flex-col gap-3">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <UserIcon className="size-4 text-muted-foreground" />
                                <Typography variant="cardTitle">Client</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {client ? (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <Typography variant="clientName" as="p" className="leading-tight">
                                                    {client.name}
                                                    {client.company && (
                                                        <Typography variant="muted" as="span" className="font-normal">
                                                            {" "}
                                                            · {client.company}
                                                        </Typography>
                                                    )}
                                                </Typography>
                                                {client.last_contact && (
                                                    <Typography
                                                        variant="badgeSmall"
                                                        as="span"
                                                        className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400"
                                                    >
                                                        {relativeDays(client.last_contact)}
                                                    </Typography>
                                                )}
                                            </div>
                                            {client.email && (
                                                <Typography variant="metadata" as="p">
                                                    {client.email}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                                            <a href={`mailto:${client.email}`} target="_blank" rel="noopener noreferrer">
                                                <MailIcon className="size-3.5" />
                                                Email
                                            </a>
                                        </Button>
                                        <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                                            <a href={`tel:${client.phone}`} target="_blank" rel="noopener noreferrer">
                                                <PhoneIcon className="size-3.5" />
                                                Call
                                            </a>
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                                            <UserIcon className="size-3.5" />
                                            View Profile
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <Typography variant="body" color="muted" className="rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-center">
                                    No client associated
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <TagIcon className="size-4 text-muted-foreground" />
                                <Typography variant="cardTitle">Tags & Category</Typography>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center gap-2">
                                {project.tags?.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1"
                                        style={{
                                            borderColor: tag.color || "var(--border)",
                                            color: tag.color || "var(--foreground)",
                                        }}
                                    >
                                        {tag.color && (
                                            <span
                                                className="size-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: tag.color }}
                                            />
                                        )}
                                        <Typography variant="label" as="span" style={tag.color ? { color: tag.color } : undefined}>{tag.name}</Typography>
                                    </span>
                                ))}
                                {project.category && (
                                    <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-1">
                                        <Typography variant="label" color="muted" as="span">+ {project.category}</Typography>
                                    </span>
                                )}
                                {(!project.tags?.length && !project.category) && (
                                    <Typography variant="body" color="muted">—</Typography>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border flex-1">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                <Typography variant="cardTitle">Timeline Snapshot</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative h-6 w-full rounded-md bg-muted">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-l-md bg-primary/60 transition-all"
                                    style={{ width: `${timelineProgress}%` }}
                                />
                                <div
                                    className="absolute top-0 bottom-0 w-px bg-foreground/80 z-10"
                                    style={{ left: `${timelineProgress}%` }}
                                />
                            </div>
                            <div className="relative flex justify-between">
                                <Typography variant="metadata" as="span">{formatDate(project.start_date, "MMM d")}</Typography>
                                <Typography variant="metadataStrong" as="span" className="absolute left-1/2 -translate-x-1/2">
                                    TODAY
                                </Typography>
                                <Typography variant="metadata" as="span">{formatDate(project.due_date, "MMM d")}</Typography>
                            </div>
                            <Typography variant="bodySmall" color="muted" className="text-center">
                                {daysLeft !== null ? `${daysLeft} days remaining` : "—"}
                                {elapsedDays >= 0 && totalDays > 0 && (
                                    <> · {elapsedDays} days elapsed</>
                                )}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-3">
                    <Card className="border border-border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <DollarSignIcon className="size-4 text-muted-foreground" />
                                <Typography variant="cardTitle">Financial Health</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2">
                            <div className="border-r border-b border-border pb-4 pr-4">
                                <Typography variant="overline" as="p">Value</Typography>
                                <Typography
                                    variant="metricValue"
                                    as="p"
                                    className={cn("mt-0.5", valueLockedGreen && "text-primary")}
                                >
                                    {formatMoney(project.value ?? 0, currency)}
                                </Typography>
                            </div>
                            <div className="border-b border-border pb-4 pl-4">
                                <Typography variant="overline" as="p">Budget</Typography>
                                <Typography variant="body" as="p" className="font-medium mt-0.5">
                                    {budgetTotal > 0
                                        ? formatMoney(budgetTotal, currency)
                                        : "—"}
                                </Typography>
                                {budgetTotal <= 0 && (
                                    <Typography variant="bodySmall" color="muted" as="p" className="mt-0.5">Not set</Typography>
                                )}
                            </div>
                            <div className="border-r border-border pt-4 pr-4">
                                <Typography variant="overline" as="p">Profit Margin</Typography>
                                <Typography variant="metricValue" as="p" color="primary" className="mt-0.5">
                                    {project.profit_margin ?? 0}%
                                </Typography>
                                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width]"
                                        style={{
                                            width: `${Math.min(100, project.profit_margin ?? 0)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 pl-4">
                                <Typography variant="overline" as="p">Unbilled</Typography>
                                <Typography variant="body" as="p" className="font-medium mt-0.5">
                                    {formatMoney(unbilledAmount, currency)}
                                </Typography>
                                <Typography variant="bodySmall" color="muted" as="p" className="mt-0.5">from time entries</Typography>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border flex-1">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="size-4 text-muted-foreground" />
                                <Typography variant="cardTitle">Time Burn</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Typography variant="body" as="span" className="font-medium">Estimated {estimatedH}h</Typography>
                                <ArrowRightIcon className="size-4 text-muted-foreground shrink-0" />
                                <Typography variant="body" as="span" className="font-medium">Actual {actualH}h</Typography>
                            </div>
                            <div>
                                <Typography variant="overline" as="p">Burn rate</Typography>
                                <Typography variant="body" as="p" className="font-medium mt-0.5">
                                    {burnRate !== null
                                        ? `${burnRate.toFixed(1)} h/day`
                                        : "No time tracked yet"}
                                </Typography>
                            </div>
                            <div>
                                <Typography variant="overline" as="p" className="mb-2">Last 7 days</Typography>
                                <div className="flex items-end gap-1 h-8">
                                    {(hoursArray.length > 0 ? hoursArray : [0, 0, 0, 0, 0, 0, 0]).map((h, i) => {
                                        const maxH = Math.max(1, ...(hoursArray.length ? hoursArray : [1]));
                                        const heightPct = maxH > 0 ? (h / maxH) * 100 : 0;
                                        const heightPx = hoursArray.length > 0 ? 4 + (heightPct / 100) * 28 : 4;
                                        const day = sparklineData?.[i];
                                        const bar = (
                                            <div
                                                key={i}
                                                className="min-w-[8px] flex-1 rounded-sm bg-primary/30 transition-all cursor-default"
                                                style={{ height: `${heightPx}px` }}
                                            />
                                        );
                                        if (day && (day.entries.length > 0 || day.hours > 0)) {
                                            return (
                                                <Tooltip key={i}>
                                                    <TooltipTrigger asChild>
                                                        {bar}
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[240px]">
                                                        <p className="font-medium">{day.dateLabel} · {day.hours.toFixed(1)}h</p>
                                                        {day.entries.length > 0 ? (
                                                            <ul className="space-y-1 text-[11px] opacity-95">
                                                                {day.entries.map((entry, j) => (
                                                                    <li key={j} className="flex justify-between gap-3">
                                                                        <span className="truncate">
                                                                            {entry.description || "Time entry"}
                                                                        </span>
                                                                        <span className="shrink-0 tabular-nums">
                                                                            {entry.hours.toFixed(1)}h
                                                                            {entry.billable && entry.rate > 0 && (
                                                                                <> · {formatMoney(entry.hours * entry.rate, currency)}</>
                                                                            )}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-[11px] opacity-95">No entries</p>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        }
                                        return (
                                            <Tooltip key={i}>
                                                <TooltipTrigger asChild>
                                                    {bar}
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    {day?.dateLabel ?? `Day ${i + 1}`} · {h}h
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                                {hoursArray.length === 0 && (
                                    <Typography variant="bodySmall" color="muted" as="p" className="mt-1">
                                        No time tracked yet
                                    </Typography>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <Card className="border border-border">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <ActivityIcon className="size-4 text-muted-foreground" />
                            <Typography variant="cardTitle">Recent Activity</Typography>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length > 0 ? (
                            <ul className="space-y-2">
                                {recentActivity.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-3"
                                    >
                                        <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                                        <Typography variant="body" as="span" className="flex-1">{item.title}</Typography>
                                        <Typography variant="metadata" as="span">
                                            {formatDate(item.date, "MMM d")}
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Typography variant="body" color="muted" className="rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-center">
                                No recent activity
                            </Typography>
                        )}
                    </CardContent>
                    <CardFooter>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="gap-1.5 h-9">
                                <PlusIcon className="size-3.5" />
                                Add Task
                            </Button>
                            <Button size="sm" variant="secondary" className="gap-1.5 h-9">
                                <ClockIcon className="size-3.5" />
                                Log Time
                            </Button>
                            <Button size="sm" variant="secondary" className="gap-1.5 h-9">
                                <FileUpIcon className="size-3.5" />
                                Create Invoice
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
