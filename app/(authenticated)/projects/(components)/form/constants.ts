import { CalendarIcon, CheckIcon, ClockIcon, DollarSignIcon, LineChartIcon, UserIcon } from "lucide-react";
import {
    FormBasics,
    FormStatusProgress,
    FormFinancials,
    FormClient,
    FormTime,
    FormTimeline,
    type ProjectForm, 
    type ProjectStatus
} from ".";

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

export const FORM_TO_PAYLOAD = {
    clientId: "client_id",
    title: "title",
    description: "description",
    status: "status",
    progress: "progress",
    priority: "priority",
    category: "category",
    color: "color",
    tags: "tags",
    currency: "currency",
    profitMargin: "profit_margin",
    value: "value",
    budget: "budget",
    estimatedHours: "estimated_hours",
    actualHours: "actual_hours",
    startDate: "start_date",
    dueDate: "due_date",
    completedDate: "completed_date",
} as const satisfies Record<keyof ProjectForm, string>;

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

export const CURRENCIES = ["GBP", "USD", "EUR"];

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

export const SECTION_COMPONENTS = {
    basics: FormBasics,
    status: FormStatusProgress,
    financials: FormFinancials,
    time: FormTime,
    timeline: FormTimeline,
    client: FormClient
} as const;