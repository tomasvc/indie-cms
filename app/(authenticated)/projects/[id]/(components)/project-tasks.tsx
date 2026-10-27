"use client";

import { useState } from "react";
import { isTaskOverdue } from "@/lib/helpers/tasks";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
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
import { Typography } from "@/components/ui/typography";
import { Task, TaskStatus } from "@/types";
import { deleteTask, updateTaskStatus } from "@/lib/actions/tasks";
import { format, isValid, parseISO } from "date-fns";
import { PlusIcon, PencilIcon, TrashIcon, ListTodoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskForm } from "./task-form";

const TASK_STATUS_LABEL: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done" };
const TASK_STATUS_VARIANT = { todo: "outline", in_progress: "info", done: "success" } as const;

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
    const [actionError, setActionError] = useState<string | null>(null);

    // Open work first, soonest due at the top; finished tasks sink to the bottom
    const filteredTasks = (statusFilter === "all" ? tasks : tasks.filter((t) => t.status === statusFilter))
        .slice()
        .sort((a, b) =>
            Number(a.status === "done") - Number(b.status === "done") ||
            (a.due_date || "9999").localeCompare(b.due_date || "9999")
        );

    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
    const doneCount = tasks.filter((t) => t.status === "done").length;

    async function handleDelete(id: string) {
        setIsSubmitting(true);
        setActionError(null);
        const formData = new FormData();
        formData.set("id", id);
        formData.set("project_id", projectId);
        const result = await deleteTask(formData);
        setIsSubmitting(false);
        if (result.error) {
            setActionError(result.error);
            return;
        }
        setDeleteTaskId(null);
        router.refresh();
    }

    async function handleStatusChange(task: Task, newStatus: TaskStatus) {
        setActionError(null);
        const result = await updateTaskStatus(task.id, projectId, newStatus);
        if (result.error) {
            setActionError(result.error);
            return;
        }
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
                            <Button>
                                <PlusIcon className="size-3.5" />
                                Add task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <TaskForm projectId={projectId} onDone={() => setAddOpen(false)} />
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

                {actionError && !deleteTaskId && (
                    <p className="mb-3 text-sm text-destructive" role="alert">{actionError}</p>
                )}

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
                                    task.status === "done" && "opacity-75",
                                    isTaskOverdue(task) && "border-destructive/40 bg-destructive/5"
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
                                    <Badge variant={TASK_STATUS_VARIANT[task.status]}>
                                        {TASK_STATUS_LABEL[task.status]}
                                    </Badge>
                                    {task.status !== "done" && (
                                        <Badge
                                            variant={
                                                task.priority === "high"
                                                    ? "destructive"
                                                    : task.priority === "low"
                                                      ? "secondary"
                                                      : "warning"
                                            }
                                        >
                                            <span className="capitalize">{task.priority}</span>
                                        </Badge>
                                    )}
                                    <span className={cn("text-[13px] whitespace-nowrap", isTaskOverdue(task) ? "text-destructive" : task.status === "done" ? "text-muted-foreground" : "text-foreground")}>
                                        Due {formatDueDate(task.due_date)}
                                    </span>
                                    {isTaskOverdue(task) && (
                                        <Badge variant="destructive">Overdue</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditTask(task)}
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
                            <TaskForm projectId={projectId} task={editTask} onDone={() => setEditTask(null)} />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTaskId(null);
                        setActionError(null);
                    }
                }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete task</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. The task will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {actionError && <p className="text-sm text-destructive" role="alert">{actionError}</p>}
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
