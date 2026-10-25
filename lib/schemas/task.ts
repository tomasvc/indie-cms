import { z } from "zod";
import { id, optionalText, requiredDate, requiredText } from "./common";
import { PRIORITIES } from "./project";

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

export const taskStatusSchema = z.enum(TASK_STATUSES, { error: "Choose a status" });

export const taskCreateSchema = z.object({
    project_id: id("Project"),
    title: requiredText("Title", 200),
    description: optionalText("Description", 2000),
    due_date: requiredDate("Due date"),
    priority: z.enum(PRIORITIES, { error: "Choose a priority" }),
});

export const taskUpdateSchema = taskCreateSchema.extend({
    id: id("Task"),
    status: taskStatusSchema,
});
