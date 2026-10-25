import { z } from "zod";
import { amount, formCheckbox, formNumber, id, optionalText, requiredDate } from "./common";

/** Radix Select can't use an empty string as an item value, so "no task" needs a sentinel. */
export const NO_TASK_VALUE = "__none__";

const taskId = z
    .string()
    .optional()
    .transform((value) => (!value || value === NO_TASK_VALUE ? null : value))
    .pipe(id("Task").nullable());

export const timeEntryCreateSchema = z.object({
    project_id: id("Project"),
    entry_date: requiredDate("Entry date"),
    description: optionalText("Description", 1000),
    task_id: taskId,
    hours: formNumber(
        z
            .number({ error: "Hours are required" })
            .positive("Hours must be more than 0")
            .max(24, "A single entry can't exceed 24 hours")
    ),
    rate: formNumber(amount("Rate"), 0),
    billable: formCheckbox,
});

export const timeEntryUpdateSchema = timeEntryCreateSchema.extend({
    id: id("Time entry"),
    approved: formCheckbox,
});
