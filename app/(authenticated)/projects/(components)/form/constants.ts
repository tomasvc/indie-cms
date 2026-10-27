import { CalendarIcon, CheckIcon, ClockIcon, DollarSignIcon, LineChartIcon, UserIcon } from "lucide-react";
import { CURRENCY_CODES } from "@/lib/constants/profile";
import type { ProjectStatus } from "@/types";
import type { ProjectFormValues, SectionId } from "./types";

// Ordered by what you know when a job starts: what it is, who it's for, the fee and the dates.
// Status, progress and estimates are optional extras.
export const SECTIONS = [
    {
        id: "basics",
        label: "Basics",
        description: "Title (required), description and category.",
        icon: CheckIcon,
    },
    {
        id: "client",
        label: "Client",
        description: "Who the work is for (required).",
        icon: UserIcon,
    },
    {
        id: "financials",
        label: "Fee & budget",
        description: "Fixed fee or hourly rate, and how much time-cost you can spend.",
        icon: DollarSignIcon,
    },
    {
        id: "timeline",
        label: "Timeline",
        description: "Start, due and completion dates.",
        icon: CalendarIcon,
    },
    {
        id: "status",
        label: "Status & progress",
        description: "Optional. Where the project stands.",
        icon: LineChartIcon,
    },
    {
        id: "time",
        label: "Time estimate",
        description: "Optional. Hours you expect to spend.",
        icon: ClockIcon,
    },
] as const;

export const FIELD_SECTIONS: Record<keyof ProjectFormValues, SectionId> = {
    title: "basics",
    description: "basics",
    category: "basics",
    color: "basics",
    tags: "basics",
    status: "status",
    priority: "status",
    progress: "status",
    currency: "financials",
    billingType: "financials",
    hourlyRate: "financials",
    value: "financials",
    budget: "financials",
    estimatedHours: "time",
    startDate: "timeline",
    dueDate: "timeline",
    completedDate: "timeline",
    clientId: "client",
};

export const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Cancelled" },
    { value: "draft", label: "Draft" },
    { value: "proposal", label: "Proposal" },
    { value: "review", label: "Review" },
];

export const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
] as const;

export const CURRENCIES = CURRENCY_CODES;

export const PROJECT_COLORS = [
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
