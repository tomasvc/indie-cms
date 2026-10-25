"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Task, TimeEntry } from "@/types";
import { createTimeEntry, updateTimeEntry } from "@/lib/actions/time-entries";
import { NO_TASK_VALUE } from "@/lib/schemas/time-entry";
import { useFormAction } from "@/hooks/use-form-action";

export function TimeEntryForm({
    projectId,
    tasks,
    currency,
    defaultHourlyRate,
    entry,
    onDone,
}: {
    projectId: string;
    tasks: Task[];
    currency: string;
    defaultHourlyRate: number;
    entry?: TimeEntry;
    onDone: () => void;
}) {
    const isEdit = !!entry;
    const { state, isPending, onSubmit, errors } = useFormAction(isEdit ? updateTimeEntry : createTimeEntry, {
        onSuccess: onDone,
    });
    const idPrefix = isEdit ? "edit-entry" : "new-entry";

    return (
        <form onSubmit={onSubmit} noValidate>
            <input type="hidden" name="project_id" value={projectId} />
            {entry && <input type="hidden" name="id" value={entry.id} />}
            <DialogHeader>
                <DialogTitle>{isEdit ? "Edit time entry" : "Log time"}</DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? "Update description, hours, rate or flags."
                        : "Add a time entry. Entry date and hours are required."}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4 py-4">
                <Field data-invalid={!!errors("entry_date")}>
                    <FieldLabel htmlFor={`${idPrefix}-date`}>Entry date</FieldLabel>
                    <Input
                        id={`${idPrefix}-date`}
                        name="entry_date"
                        type="date"
                        required
                        defaultValue={entry?.entry_date?.split("T")[0] ?? format(new Date(), "yyyy-MM-dd")}
                        aria-invalid={!!errors("entry_date")}
                    />
                    <FieldError errors={errors("entry_date")} />
                </Field>
                <Field data-invalid={!!errors("description")}>
                    <FieldLabel htmlFor={`${idPrefix}-description`}>Description</FieldLabel>
                    <Textarea
                        id={`${idPrefix}-description`}
                        name="description"
                        defaultValue={entry?.description ?? ""}
                        placeholder="What did you work on?"
                        className="min-h-[80px]"
                        aria-invalid={!!errors("description")}
                    />
                    <FieldError errors={errors("description")} />
                </Field>
                <Field data-invalid={!!errors("task_id")}>
                    <FieldLabel htmlFor={`${idPrefix}-task`}>Task (optional)</FieldLabel>
                    <Select name="task_id" defaultValue={entry?.task_id ?? NO_TASK_VALUE}>
                        <SelectTrigger id={`${idPrefix}-task`} aria-invalid={!!errors("task_id")}>
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_TASK_VALUE}>None</SelectItem>
                            {tasks.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError errors={errors("task_id")} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={!!errors("hours")}>
                        <FieldLabel htmlFor={`${idPrefix}-hours`}>Hours</FieldLabel>
                        <Input
                            id={`${idPrefix}-hours`}
                            name="hours"
                            type="number"
                            min={0}
                            step={0.25}
                            required
                            defaultValue={entry?.hours}
                            placeholder="0"
                            aria-invalid={!!errors("hours")}
                        />
                        <FieldError errors={errors("hours")} />
                    </Field>
                    <Field data-invalid={!!errors("rate")}>
                        <FieldLabel htmlFor={`${idPrefix}-rate`}>Rate ({currency})</FieldLabel>
                        <Input
                            id={`${idPrefix}-rate`}
                            name="rate"
                            type="number"
                            min={0}
                            step={0.01}
                            defaultValue={entry?.rate ?? defaultHourlyRate}
                            placeholder="0"
                            aria-invalid={!!errors("rate")}
                        />
                        <FieldError errors={errors("rate")} />
                    </Field>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id={`${idPrefix}-billable`} name="billable" defaultChecked={entry?.billable ?? true} />
                        <label htmlFor={`${idPrefix}-billable`} className="text-sm font-medium">
                            Billable
                        </label>
                    </div>
                    {entry && (
                        <div className="flex items-center gap-2">
                            <Checkbox id={`${idPrefix}-approved`} name="approved" defaultChecked={entry.approved} />
                            <label htmlFor={`${idPrefix}-approved`} className="text-sm font-medium">
                                Approved
                            </label>
                        </div>
                    )}
                </div>
                {state.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : isEdit ? "Save changes" : "Log time"}
                </Button>
            </DialogFooter>
        </form>
    );
}
