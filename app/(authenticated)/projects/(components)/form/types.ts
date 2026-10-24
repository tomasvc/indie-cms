import {
    type ProjectStatus,
    SECTIONS,
} from ".";

export type ProjectForm = {
    title: string;
    description: string;
    category: string;
    color: string;
    tags: string;
    status: ProjectStatus;
    priority: "low" | "medium" | "high";
    progress: number;
    currency: string;
    profitMargin: number;
    value: number;
    budget: number;
    estimatedHours: number;
    actualHours: number;
    startDate: string;
    dueDate: string;
    completedDate: string;
    clientId: string;
}

export type SectionId = (typeof SECTIONS)[number]["id"];