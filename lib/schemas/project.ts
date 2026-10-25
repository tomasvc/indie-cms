import { z } from "zod";
import { amount, isOnOrAfter, optionalDate, optionalId, optionalText, requiredText } from "./common";

export const PROJECT_STATUSES = ["proposal", "active", "on_hold", "review", "completed", "archived", "draft"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;

export const projectStatusSchema = z.enum(PROJECT_STATUSES, { error: "Choose a valid status" });

const hours = (label: string) => amount(label).max(100_000, `${label} looks too high`);

export const projectFormSchema = z
    .object({
        title: requiredText("Title", 120),
        description: optionalText("Description", 2000),
        category: optionalText("Category", 60),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #22c55e"),
        tags: optionalText("Tags", 500),
        status: projectStatusSchema,
        priority: z.enum(PRIORITIES, { error: "Choose a priority" }),
        progress: z
            .number({ error: "Progress must be a number" })
            .int()
            .min(0, "Progress can't be below 0%")
            .max(100, "Progress can't exceed 100%"),
        currency: z.string().regex(/^[A-Z]{3}$/, "Choose a currency"),
        profitMargin: z
            .number({ error: "Profit margin must be a number" })
            .min(0, "Profit margin can't be below 0%")
            .max(100, "Profit margin can't exceed 100%"),
        value: amount("Project value"),
        budget: amount("Budget"),
        estimatedHours: hours("Estimated hours"),
        actualHours: hours("Actual hours"),
        startDate: optionalDate("Start date"),
        dueDate: optionalDate("Due date"),
        completedDate: optionalDate("Completed date"),
        clientId: optionalId("Client"),
    })
    .refine((v) => isOnOrAfter(v.dueDate, v.startDate), {
        error: "Due date must be on or after the start date",
        path: ["dueDate"],
    })
    .refine((v) => isOnOrAfter(v.completedDate, v.startDate), {
        error: "Completed date must be on or after the start date",
        path: ["completedDate"],
    });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
