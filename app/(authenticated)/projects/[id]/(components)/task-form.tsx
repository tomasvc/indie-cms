"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Task, TaskStatus } from "@/types";
import { createTask, updateTask } from "@/lib/actions/tasks";
import { useFormAction } from "@/hooks/use-form-action";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "To do" },
    { value: "in_progress", label: "In progress" },
    { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
] as const;

export function TaskForm({
    projectId,
    task,
    onDone,
}: {
    projectId: string;
    task?: Task;
    onDone: () => void;
}) {
    const isEdit = !!task;
    const { state, isPending, onSubmit, errors } = useFormAction(isEdit ? updateTask : createTask, {
        onSuccess: onDone,
    });
    const idPrefix = isEdit ? "edit-task" : "new-task";

    return (
        <form onSubmit={onSubmit} noValidate>
            <input type="hidden" name="project_id" value={projectId} />
            {task && <input type="hidden" name="id" value={task.id} />}
            <DialogHeader>
                <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? "Update title, status, due date or priority."
                        : "Add a task to this project. Due date is required."}
                </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4 py-4">
                <Field data-invalid={!!errors("title")}>
                    <FieldLabel htmlFor={`${idPrefix}-title`}>Title</FieldLabel>
                    <Input
                        id={`${idPrefix}-title`}
                        name="title"
                        defaultValue={task?.title}
                        placeholder="e.g. Review design mockups"
                        required
                        aria-invalid={!!errors("title")}
                    />
                    <FieldError errors={errors("title")} />
                </Field>
                <Field data-invalid={!!errors("description")}>
                    <FieldLabel htmlFor={`${idPrefix}-description`}>Description</FieldLabel>
                    <Textarea
                        id={`${idPrefix}-description`}
                        name="description"
                        defaultValue={task?.description}
                        placeholder="Optional details"
                        className="min-h-[80px]"
                        aria-invalid={!!errors("description")}
                    />
                    <FieldError errors={errors("description")} />
                </Field>
                {task && (
                    <Field data-invalid={!!errors("status")}>
                        <FieldLabel htmlFor={`${idPrefix}-status`}>Status</FieldLabel>
                        <Select name="status" defaultValue={task.status}>
                            <SelectTrigger id={`${idPrefix}-status`} aria-invalid={!!errors("status")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError errors={errors("status")} />
                    </Field>
                )}
                <Field data-invalid={!!errors("due_date")}>
                    <FieldLabel htmlFor={`${idPrefix}-due-date`}>Due date</FieldLabel>
                    <Input
                        id={`${idPrefix}-due-date`}
                        name="due_date"
                        type="date"
                        defaultValue={task?.due_date?.split("T")[0] ?? ""}
                        required
                        aria-invalid={!!errors("due_date")}
                    />
                    <FieldError errors={errors("due_date")} />
                </Field>
                <Field data-invalid={!!errors("priority")}>
                    <FieldLabel htmlFor={`${idPrefix}-priority`}>Priority</FieldLabel>
                    <Select name="priority" defaultValue={task?.priority ?? "medium"}>
                        <SelectTrigger id={`${idPrefix}-priority`} aria-invalid={!!errors("priority")}>
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_OPTIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError errors={errors("priority")} />
                </Field>
                {state.error && !state.fieldErrors && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isEdit
                        ? isPending ? "Saving…" : "Save changes"
                        : isPending ? "Adding…" : "Add task"}
                </Button>
            </DialogFooter>
        </form>
    );
}
