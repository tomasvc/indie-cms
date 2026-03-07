"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Typography } from "@/components/ui/typography";
import { Task, TaskStatus } from "@/types";
import {
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
} from "@/lib/actions/tasks";
import { format, isValid, parseISO } from "date-fns";
import { PlusIcon, PencilIcon, TrashIcon, ListTodoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

function formatDueDate(dateStr: string | undefined | null): string {
    if (!dateStr) return "—";
    try {
        const d = typeof dateStr === "string" && dateStr.includes("T") ? parseISO(dateStr) : new Date(dateStr);
        return isValid(d) ? format(d, "MMM d, yyyy") : "—";
    } catch {
        return "—";
    }
}

export function ProjectTasks({
    projectId,
    tasks,
}: {
    projectId: string;
    tasks: Task[];
}) {
    const router = useRouter();
    const [addOpen, setAddOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addPriority, setAddPriority] = useState<"low" | "medium" | "high">("medium");
    const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
    const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");

    const filteredTasks =
        statusFilter === "all"
            ? tasks
            : tasks.filter((t) => t.status === statusFilter);

    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    async function handleCreate(formData: FormData) {
        setIsSubmitting(true);
        try {
            formData.set("project_id", projectId);
            await createTask(formData);
            setAddOpen(false);
            router.refresh();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleUpdate(formData: FormData) {
        if (!editTask) return;
        setIsSubmitting(true);
        try {
            formData.set("id", editTask.id);
            formData.set("project_id", projectId);
            await updateTask(formData);
            setEditTask(null);
            router.refresh();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.set("id", id);
            formData.set("project_id", projectId);
            await deleteTask(formData);
            setDeleteTaskId(null);
            router.refresh();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleStatusChange(task: Task, newStatus: TaskStatus) {
        await updateTaskStatus(task.id, projectId, newStatus);
        router.refresh();
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle>
                            <Typography variant="cardTitle" as="span">
                                Tasks
                            </Typography>
                        </CardTitle>
                        <CardDescription>
                            <Typography variant="body" color="muted" as="span">
                                Track and manage work for this project.
                            </Typography>
                        </CardDescription>
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <PlusIcon className="size-3.5" />
                                Add task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleCreate}>
                                <input type="hidden" name="project_id" value={projectId} />
                                <DialogHeader>
                                    <DialogTitle>New task</DialogTitle>
                                    <DialogDescription>
                                        Add a task to this project. Due date is required.
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup className="gap-4 py-4">
                                    <Field>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input
                                            name="title"
                                            placeholder="e.g. Review design mockups"
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            name="description"
                                            placeholder="Optional details"
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Due date</FieldLabel>
                                        <Input name="due_date" type="date" required />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Priority</FieldLabel>
                                        <Select name="priority" value={addPriority} onValueChange={(v) => setAddPriority(v as "low" | "medium" | "high")}>
                                            <SelectTrigger>
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
                                        <input type="hidden" name="priority" value={addPriority} />
                                    </Field>
                                </FieldGroup>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setAddOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Adding…" : "Add task"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                    >
                        All ({tasks.length})
                    </Button>
                    <Button
                        variant={statusFilter === "todo" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("todo")}
                    >
                        To do ({todoCount})
                    </Button>
                    <Button
                        variant={statusFilter === "in_progress" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("in_progress")}
                    >
                        In progress ({inProgressCount})
                    </Button>
                    <Button
                        variant={statusFilter === "done" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("done")}
                    >
                        Done ({doneCount})
                    </Button>
                </div>

                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] border border-dashed border-muted rounded-lg bg-muted/40 text-center p-6">
                        <ListTodoIcon className="size-10 text-muted-foreground/70 mb-3" />
                        <Typography variant="subtitle" className="mb-1">
                            {tasks.length === 0 ? "No tasks yet" : "No tasks in this filter"}
                        </Typography>
                        <Typography variant="bodySmall" color="muted">
                            {tasks.length === 0
                                ? "Add a task to get started."
                                : "Try another status filter."}
                        </Typography>
                        {tasks.length === 0 && (
                            <Button
                                className="mt-3"
                                onClick={() => setAddOpen(true)}
                            >
                                <PlusIcon className="size-3.5" />
                                Add task
                            </Button>
                        )}
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {filteredTasks.map((task) => (
                            <li
                                key={task.id}
                                className={cn(
                                    "flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors",
                                    task.status === "done" && "opacity-75"
                                )}
                            >
                                <Checkbox
                                    checked={task.status === "done"}
                                    onCheckedChange={(checked) =>
                                        handleStatusChange(
                                            task,
                                            checked ? "done" : "todo"
                                        )
                                    }
                                    aria-label={task.status === "done" ? "Mark not done" : "Mark done"}
                                />
                                <div className="min-w-0 flex-1">
                                    <Typography
                                        variant="body"
                                        as="span"
                                        className={cn(
                                            "font-medium",
                                            task.status === "done" && "line-through text-muted-foreground"
                                        )}
                                    >
                                        {task.title}
                                    </Typography>
                                    {task.description && (
                                        <Typography
                                            variant="bodySmall"
                                            color="muted"
                                            className="mt-0.5 line-clamp-1"
                                        >
                                            {task.description}
                                        </Typography>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="capitalize">
                                        {task.status.replace("_", " ")}
                                    </Badge>
                                    <Badge
                                        variant={
                                            task.priority === "high"
                                                ? "destructive"
                                                : task.priority === "low"
                                                  ? "secondary"
                                                  : "outline"
                                        }
                                    >
                                        {task.priority}
                                    </Badge>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        Due {formatDueDate(task.due_date)}
                                    </span>
                                    {task.is_overdue && task.status !== "done" && (
                                        <Badge variant="destructive">Overdue</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditTask(task);
                                            setEditStatus(task.status);
                                            setEditPriority(task.priority);
                                        }}
                                        aria-label="Edit task"
                                    >
                                        <PencilIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteTaskId(task.id)}
                                        aria-label="Delete task"
                                    >
                                        <TrashIcon className="size-3.5 text-destructive" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Edit task dialog */}
                <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
                    <DialogContent>
                        {editTask && (
                            <form action={handleUpdate}>
                                <input type="hidden" name="id" value={editTask.id} />
                                <input type="hidden" name="project_id" value={projectId} />
                                <input type="hidden" name="status" value={editStatus} />
                                <input type="hidden" name="priority" value={editPriority} />
                                <DialogHeader>
                                    <DialogTitle>Edit task</DialogTitle>
                                    <DialogDescription>
                                        Update title, status, due date or priority.
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup className="gap-4 py-4">
                                    <Field>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input
                                            name="title"
                                            defaultValue={editTask.title}
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            name="description"
                                            defaultValue={editTask.description}
                                            className="min-h-[80px]"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select name="status" value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                                            <SelectTrigger>
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
                                    </Field>
                                    <Field>
                                        <FieldLabel>Due date</FieldLabel>
                                        <Input
                                            name="due_date"
                                            type="date"
                                            defaultValue={
                                                editTask.due_date
                                                    ? editTask.due_date.split("T")[0]
                                                    : ""
                                            }
                                            required
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Priority</FieldLabel>
                                        <Select name="priority" value={editPriority} onValueChange={(v) => setEditPriority(v as "low" | "medium" | "high")}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORITY_OPTIONS.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </FieldGroup>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditTask(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving…" : "Save changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete task</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. The task will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteTaskId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (deleteTaskId) handleDelete(deleteTaskId);
                                }}
                                disabled={isSubmitting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isSubmitting ? "Deleting…" : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
