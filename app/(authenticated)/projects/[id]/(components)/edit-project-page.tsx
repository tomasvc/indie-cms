"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { Client, Project, ProjectStatus } from "@/types";
import { handleUpdateProject } from "@/lib/actions/projects";
import {
    DollarSignIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    LineChartIcon,
    SaveIcon,
    XIcon,
    CheckIcon,
} from "lucide-react";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { formatMoney, formatDate } from "@/lib/helpers/format";

const SECTIONS = [
    {
        id: "basics",
        label: "Basics",
        description: "Core project identity - title, description and categorisation.",
        icon: CheckIcon,
    },
    {
        id: "status",
        label: "Status & Progress",
        description: "Track where this project stands and how far along it is.",
        icon: LineChartIcon,
    },
    {
        id: "financials",
        label: "Financials",
        description: "Project value, budget and currency settings.",
        icon: DollarSignIcon,
    },
    {
        id: "time",
        label: "Time",
        description: "Estimated and actual hours for burn-rate tracking.",
        icon: ClockIcon,
    },
    {
        id: "timeline",
        label: "Timeline",
        description: "Project start, due and completion dates.",
        icon: CalendarIcon,
    },
    {
        id: "client",
        label: "Client",
        description: "Link this project to a client in your account.",
        icon: UserIcon,
    },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Cancelled" },
    { value: "draft", label: "Draft" },
    { value: "proposal", label: "Proposal" },
    { value: "review", label: "Review" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
] as const;

const CURRENCIES = ["GBP", "USD", "EUR"];

const PROJECT_COLORS = [
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#f97316",
    "#ef4444",
    "#14b8a6",
    "#ec4899",
    "#84cc16",
    "#475569",
];

export function EditProjectPage({
    project,
    clients,
}: {
    project: Project;
    clients: Client[];
}) {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<SectionId>("basics");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState(project.title || "");
    const [description, setDescription] = useState(project.description || "");
    const [category, setCategory] = useState(project.category || "Web Design");
    const [color, setColor] = useState(project.color || "#22c55e");
    const [tagsInput, setTagsInput] = useState(
        project.tags?.map((t) => t.name).join(", ") || ""
    );
    const [status, setStatus] = useState<ProjectStatus>(project.status || "active");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
        project.priority || "medium"
    );
    const [progress, setProgress] = useState(project.progress ?? 50);
    const [currency, setCurrency] = useState(project.currency || "GBP");
    const [profitMargin, setProfitMargin] = useState(project.profit_margin ?? 57);
    const [value, setValue] = useState(project.value ?? 10000);
    const [budget, setBudget] = useState(project.budget ?? 15000);
    const [estimatedHours, setEstimatedHours] = useState(
        project.estimated_hours ?? 80
    );
    const [actualHours, setActualHours] = useState(project.actual_hours ?? 8);
    const [startDate, setStartDate] = useState(
        project.start_date ? format(project.start_date.includes("T") ? parseISO(project.start_date) : new Date(project.start_date), "yyyy-MM-dd") : ""
    );
    const [dueDate, setDueDate] = useState(
        project.due_date ? format(project.due_date.includes("T") ? parseISO(project.due_date) : new Date(project.due_date), "yyyy-MM-dd") : ""
    );
    const [completedDate, setCompletedDate] = useState(
        project.completed_date
            ? format(
                project.completed_date.includes("T")
                    ? parseISO(project.completed_date)
                    : new Date(project.completed_date),
                "yyyy-MM-dd"
            )
            : ""
    );
    const [clientId, setClientId] = useState(project.client_id || "");

    const linkedClient = clientId
        ? clients.find((c) => c.id === clientId)
        : null;
    const remaining = Math.max(0, budget - value);
    const timeBurnPct =
        estimatedHours > 0
            ? Math.min(100, (actualHours / estimatedHours) * 100)
            : 0;
    const startDt = startDate ? new Date(startDate) : null;
    const dueDt = dueDate ? new Date(dueDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining =
        dueDt && startDt && isValid(dueDt)
            ? Math.max(0, differenceInDays(dueDt, today))
            : 0;

    async function onSubmit(formData: FormData) {
        setIsSubmitting(true);
        formData.set("id", project.id);
        formData.set("client_id", clientId);
        formData.set("title", title);
        formData.set("description", description);
        formData.set("status", status);
        formData.set("progress", String(progress));
        formData.set("priority", priority);
        formData.set("category", category);
        formData.set("color", color);
        formData.set("currency", currency);
        formData.set("profit_margin", String(profitMargin));
        formData.set("value", String(value));
        formData.set("budget", String(budget));
        formData.set("estimated_hours", String(estimatedHours));
        formData.set("actual_hours", String(actualHours));
        formData.set("start_date", startDate);
        formData.set("due_date", dueDate);
        formData.set("completed_date", completedDate || "");
        try {
            await handleUpdateProject(formData);
            router.push(`/projects/${project.id}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/projects/${project.id}`} aria-label="Cancel">
                            <XIcon className="size-4" />
                        </Link>
                    </Button>
                    <span className="text-muted-foreground text-sm font-medium">
                        EDITING
                    </span>
                    <Typography variant="body" as="span" className="font-medium">
                        {project.title}
                    </Typography>
                </div>
                <Button
                    size="lg"
                    onClick={() => {
                        const form = document.getElementById(
                            "edit-project-form"
                        ) as HTMLFormElement;
                        if (form) form.requestSubmit();
                    }}
                    disabled={isSubmitting}
                >
                    <SaveIcon className="size-3.5" />
                    Save changes
                </Button>
            </div>

            {/* Page title */}
            <div className="border-b border-border px-6 py-5">
                <Typography variant="pageTitle" as="h1">
                    Edit Project
                </Typography>
                <Typography
                    variant="subtitle"
                    className="text-muted-foreground mt-0.5"
                >
                    Changes are reflected immediately on the project overview.
                </Typography>
            </div>

            <form
                id="edit-project-form"
                action={onSubmit}
                className="flex flex-1 min-h-0"
            >
                <input type="hidden" name="id" value={project.id} />

                <div className="flex flex-1 min-h-0">
                    {/* Left sidebar nav */}
                    <nav className="w-56 shrink-0 border-r border-border bg-muted/30 flex flex-col">
                        {SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveSection(section.id as SectionId)
                                    }
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-2.5 text-left transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <Typography
                                            variant="label"
                                            className="font-medium"
                                        >
                                            {section.label}
                                        </Typography>
                                        <Typography
                                            variant="bodySmall"
                                            className="text-muted-foreground mt-0.5 line-clamp-2"
                                        >
                                            {section.description}
                                        </Typography>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Main content */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeSection === "basics" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>PROJECT TITLE</FieldLabel>
                                        <Input
                                            name="title"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder="e.g. Branding Website"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>DESCRIPTION</FieldLabel>
                                        <FieldDescription>
                                            A short summary visible on project
                                            cards and reports.
                                        </FieldDescription>
                                        <Textarea
                                            name="description"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="e.g. Animation-rich branding pages for a client"
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>CATEGORY</FieldLabel>
                                        <Input
                                            name="category"
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                            placeholder="e.g. Web Design"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>PROJECT COLOR</FieldLabel>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {PROJECT_COLORS.map((c) => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setColor(c)}
                                                    className={cn(
                                                        "size-8 rounded-full border-2 transition-all",
                                                        color === c
                                                            ? "border-foreground scale-110"
                                                            : "border-transparent hover:scale-105"
                                                    )}
                                                    style={{
                                                        backgroundColor: c,
                                                    }}
                                                    aria-label={`Color ${c}`}
                                                />
                                            ))}
                                            <Input
                                                name="color"
                                                value={color}
                                                onChange={(e) =>
                                                    setColor(e.target.value)
                                                }
                                                className="ml-2 w-24 font-mono text-xs"
                                            />
                                            <span
                                                className="size-6 rounded border border-border shrink-0"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                    </Field>
                                    <Field>
                                        <FieldLabel>TAGS</FieldLabel>
                                        <FieldDescription>
                                            Separate tags with commas
                                        </FieldDescription>
                                        <Input
                                            value={tagsInput}
                                            onChange={(e) =>
                                                setTagsInput(e.target.value)
                                            }
                                            placeholder="Animation, Branding, Web Design"
                                        />
                                        {tagsInput && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {tagsInput
                                                    .split(",")
                                                    .map((t) => t.trim())
                                                    .filter(Boolean)
                                                    .map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs"
                                                        >
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setTagsInput(
                                                                        tagsInput
                                                                            .split(",")
                                                                            .map((x) => x.trim())
                                                                            .filter((x) => x !== tag)
                                                                            .join(", ")
                                                                    )
                                                                }
                                                                className="text-muted-foreground hover:text-foreground"
                                                            >
                                                                <XIcon className="size-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </div>
                        )}

                        {activeSection === "status" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>STATUS</FieldLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {STATUS_OPTIONS.map((opt) => (
                                                <Button
                                                    key={opt.value}
                                                    type="button"
                                                    variant={
                                                        status === opt.value
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setStatus(opt.value)
                                                    }
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field>
                                        <FieldLabel>PRIORITY</FieldLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {PRIORITY_OPTIONS.map((opt) => (
                                                <Button
                                                    key={opt.value}
                                                    type="button"
                                                    variant={
                                                        priority === opt.value
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    className={cn(
                                                        priority ===
                                                        opt.value &&
                                                        opt.value ===
                                                        "medium" &&
                                                        "bg-orange-500 hover:bg-orange-600"
                                                    )}
                                                    onClick={() =>
                                                        setPriority(opt.value)
                                                    }
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field>
                                        <FieldLabel>PROGRESS</FieldLabel>
                                        <FieldDescription>
                                            Drag to set the current completion
                                            percentage.
                                        </FieldDescription>
                                        <p className="text-muted-foreground text-xs font-medium mb-2">
                                            Completion percentage
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={progress}
                                                onChange={(e) =>
                                                    setProgress(
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary"
                                            />
                                            <span className="text-primary font-medium text-sm w-10">
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                            <span>0%</span>
                                            <span>25%</span>
                                            <span>50%</span>
                                            <span>75%</span>
                                            <span>100%</span>
                                        </div>
                                    </Field>
                                </FieldGroup>
                            </div>
                        )}

                        {activeSection === "financials" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>CURRENCY</FieldLabel>
                                            <Select
                                                name="currency"
                                                value={currency}
                                                onValueChange={setCurrency}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CURRENCIES.map((c) => (
                                                        <SelectItem
                                                            key={c}
                                                            value={c}
                                                        >
                                                            {c}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field>
                                            <FieldLabel>
                                                PROFIT MARGIN
                                            </FieldLabel>
                                            <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                                                <Input
                                                    name="profit_margin"
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={profitMargin}
                                                    onChange={(e) =>
                                                        setProfitMargin(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                                                />
                                                <span className="text-muted-foreground text-sm">
                                                    %
                                                </span>
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>PROJECT VALUE</FieldLabel>
                                            <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                                                <span className="text-muted-foreground pl-2.5 text-sm">
                                                    {currency}
                                                </span>
                                                <Input
                                                    name="value"
                                                    type="number"
                                                    min={0}
                                                    value={value}
                                                    onChange={(e) =>
                                                        setValue(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="border-0 rounded-none flex-1 h-8 py-[7px]"
                                                />
                                            </div>
                                        </Field>
                                        <Field>
                                            <FieldLabel>BUDGET</FieldLabel>
                                            <div className="flex items-center border border-input rounded-md bg-input/20 overflow-hidden">
                                                <span className="text-muted-foreground pl-2.5 text-sm">
                                                    {currency}
                                                </span>
                                                <Input
                                                    name="budget"
                                                    type="number"
                                                    min={0}
                                                    value={budget}
                                                    onChange={(e) =>
                                                        setBudget(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="border-0 rounded-none flex-1 h-8 py-[7px]"
                                                />
                                            </div>
                                        </Field>
                                    </div>
                                    <div className="flex gap-6 pt-2">
                                        <span className="text-primary text-sm font-medium">
                                            Remaining:{" "}
                                            {formatMoney(
                                                remaining,
                                                currency
                                            )}
                                        </span>
                                        <span className="text-primary text-sm font-medium">
                                            Margin: {profitMargin}%
                                        </span>
                                    </div>
                                </FieldGroup>
                            </div>
                        )}

                        {activeSection === "time" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>
                                                ESTIMATED HOURS
                                            </FieldLabel>
                                            <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                                                <Input
                                                    name="estimated_hours"
                                                    type="number"
                                                    min={0}
                                                    value={estimatedHours}
                                                    onChange={(e) =>
                                                        setEstimatedHours(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                                                />
                                                <span className="text-muted-foreground text-sm">
                                                    h
                                                </span>
                                            </div>
                                        </Field>
                                        <Field>
                                            <FieldLabel>ACTUAL HOURS</FieldLabel>
                                            <div className="flex items-center gap-1 border border-input rounded-md bg-input/20 px-2.5 py-[7px]">
                                                <Input
                                                    name="actual_hours"
                                                    type="number"
                                                    min={0}
                                                    value={actualHours}
                                                    onChange={(e) =>
                                                        setActualHours(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="border-0 bg-transparent h-7 p-0 shadow-none focus-visible:ring-0"
                                                />
                                                <span className="text-muted-foreground text-sm">
                                                    h
                                                </span>
                                            </div>
                                        </Field>
                                    </div>
                                    <Field>
                                        <FieldLabel>Time burn</FieldLabel>
                                        <div className="flex items-center gap-3">
                                            <Progress
                                                value={timeBurnPct}
                                                className="flex-1 h-2"
                                            />
                                            <span className="text-muted-foreground text-sm whitespace-nowrap">
                                                {actualHours}h / {estimatedHours}h
                                                ({Math.round(timeBurnPct)}%)
                                            </span>
                                        </div>
                                    </Field>
                                </FieldGroup>
                            </div>
                        )}

                        {activeSection === "timeline" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>START DATE</FieldLabel>
                                            <Input
                                                name="start_date"
                                                type="date"
                                                value={startDate}
                                                onChange={(e) =>
                                                    setStartDate(e.target.value)
                                                }
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>DUE DATE</FieldLabel>
                                            <Input
                                                name="due_date"
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) =>
                                                    setDueDate(e.target.value)
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <Field>
                                        <FieldLabel>COMPLETED DATE</FieldLabel>
                                        <FieldDescription>
                                            Leave blank if the project is still
                                            in progress.
                                        </FieldDescription>
                                        <Input
                                            name="completed_date"
                                            type="date"
                                            value={completedDate}
                                            onChange={(e) =>
                                                setCompletedDate(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="dd/mm/yyyy"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>TIMELINE PREVIEW</FieldLabel>
                                        <div className="rounded-md border border-border p-4">
                                            {startDt && dueDt && (
                                                <>
                                                    <div className="relative h-8 flex items-center">
                                                        <div className="flex-1 h-1.5 rounded-full bg-muted" />
                                                        <span
                                                            className="absolute left-0 text-[10px] text-muted-foreground"
                                                            style={{ left: 0 }}
                                                        >
                                                            {formatDate(
                                                                startDate,
                                                                "MMM d"
                                                            )}
                                                        </span>
                                                        <span
                                                            className="absolute right-0 text-[10px] text-muted-foreground"
                                                            style={{ right: 0 }}
                                                        >
                                                            {formatDate(
                                                                dueDate,
                                                                "MMM d"
                                                            )}
                                                        </span>
                                                        <span
                                                            className="absolute size-2.5 rounded-full bg-primary border-2 border-background"
                                                            style={{
                                                                left: "50%",
                                                                transform:
                                                                    "translateX(-50%)",
                                                            }}
                                                            title="TODAY"
                                                        />
                                                    </div>
                                                    <p className="text-muted-foreground text-xs mt-2">
                                                        {daysRemaining} days
                                                        remaining
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </Field>
                                </FieldGroup>
                            </div>
                        )}

                        {activeSection === "client" && (
                            <div className="max-w-2xl space-y-6">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>CLIENT ID</FieldLabel>
                                        <FieldDescription>
                                            The internal ID of the linked
                                            client record.
                                        </FieldDescription>
                                        <Input
                                            readOnly
                                            value={clientId || "—"}
                                            className="bg-muted/50"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Client</FieldLabel>
                                        <Select
                                            value={clientId}
                                            onValueChange={setClientId}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.company || c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    {linkedClient && (
                                        <Card>
                                            <CardContent className="flex items-center gap-3 py-4">
                                                <Avatar size="lg">
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {(linkedClient.company || linkedClient.name)
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Typography
                                                        variant="body"
                                                        className="font-semibold"
                                                    >
                                                        {linkedClient.company ||
                                                            linkedClient.name}
                                                    </Typography>
                                                    {linkedClient.email && (
                                                        <Typography
                                                            variant="bodySmall"
                                                            className="text-muted-foreground"
                                                        >
                                                            {
                                                                linkedClient.email
                                                            }
                                                        </Typography>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </FieldGroup>
                            </div>
                        )}
                    </div>
                </div>
            </form>

            {/* Bottom bar */}
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                <Button variant="outline" asChild>
                    <Link href={`/projects/${project.id}`}>Cancel</Link>
                </Button>
                <Button
                    type="submit"
                    form="edit-project-form"
                    disabled={isSubmitting}
                >
                    <SaveIcon className="size-3.5" />
                    Save changes
                </Button>
            </div>
        </Card>
    );
}
