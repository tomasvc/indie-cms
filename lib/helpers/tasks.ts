import { addDaysISO, todayISO } from "@/lib/money";

type TaskTiming = { status: string; due_date?: string | null };

export function isTaskDone(task: { status: string }) {
    return task.status === "done";
}

export function isTaskOverdue(task: TaskTiming, today = todayISO()) {
    return !isTaskDone(task) && !!task.due_date && task.due_date.slice(0, 10) < today;
}

export function isTaskUpcoming(task: TaskTiming, today = todayISO(), daysAhead = 14) {
    if (isTaskDone(task) || !task.due_date) return false;
    const due = task.due_date.slice(0, 10);
    const horizon = addDaysISO(today, daysAhead);
    return due >= today && due <= horizon;
}
