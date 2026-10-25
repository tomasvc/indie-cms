import { CalendarIcon, CheckIcon, ClockIcon, DollarSignIcon, LineChartIcon, UserIcon } from "lucide-react";
import { CURRENCY_CODES } from "@/lib/constants/profile";
import type { ProjectStatus } from "@/types";
import type { ProjectFormValues, SectionId } from "./types";

export const SECTIONS = [
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
    profitMargin: "financials",
    value: "financials",
    budget: "financials",
    estimatedHours: "time",
    actualHours: "time",
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
