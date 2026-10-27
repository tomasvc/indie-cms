import type { DashboardCoreData } from "@/lib/data/dashboard";
import { isOverdue } from "@/lib/helpers/invoices";
import { addDaysISO, todayISO } from "@/lib/money";

// Active clients with no recorded contact for this long show up as needing a follow-up
const FOLLOW_UP_AFTER_DAYS = 30;

export type ActivityItem = {
    id: string;
    type: "invoice" | "project" | "client" | "task";
    /** What happened, as a short sentence. */
    text: string;
    projectTitle?: string;
    /** ISO timestamp, or a yyyy-MM-dd date when only the day is known. */
    timestamp: string;
    dateOnly: boolean;
    href: string;
};

/**
 * Things that happened, newest first. Only real events with their own dates are listed
 * (payments, tasks finished, invoices falling overdue, new work), not every edit.
 */
export function getRecentActivity(coreData: DashboardCoreData, limit = 15, today = todayISO()): ActivityItem[] {
    const items: ActivityItem[] = [];
    const projectTitle = new Map(coreData.projects.map((project) => [project.id, project.title]));
    const clientName = new Map(coreData.clients.map((client) => [client.id, client.name]));

    for (const invoice of coreData.invoices) {
        const client = clientName.get(invoice.client_id) ?? "A client";
        if (invoice.sent_at) {
            items.push({
                id: `invoice-sent-${invoice.id}`,
                type: "invoice",
                text: `Sent INV-${invoice.code} to ${client}`,
                projectTitle: projectTitle.get(invoice.project_id),
                timestamp: invoice.sent_at,
                dateOnly: false,
                href: `/invoices/${invoice.id}`,
            });
        }
        if (invoice.status === "paid" && invoice.paid_date) {
            items.push({
                id: `invoice-paid-${invoice.id}`,
                type: "invoice",
                text: `${client} paid INV-${invoice.code}`,
                projectTitle: projectTitle.get(invoice.project_id),
                timestamp: invoice.paid_date.slice(0, 10),
                dateOnly: true,
                href: `/invoices/${invoice.id}`,
            });
        } else if (isOverdue(invoice, today) && invoice.due_date) {
            items.push({
                id: `invoice-overdue-${invoice.id}`,
                type: "invoice",
                text: `INV-${invoice.code} to ${client} became overdue`,
                projectTitle: projectTitle.get(invoice.project_id),
                timestamp: addDaysISO(invoice.due_date.slice(0, 10), 1),
                dateOnly: true,
                href: `/invoices/${invoice.id}`,
            });
        }
    }

    for (const task of coreData.tasks) {
        if (!task.completed_date) continue;
        items.push({
            id: `task-${task.id}`,
            type: "task",
            text: `Finished “${task.title}”`,
            projectTitle: projectTitle.get(task.project_id),
            timestamp: task.completed_date,
            dateOnly: task.completed_date.length <= 10,
            href: `/projects/${task.project_id}`,
        });
    }

    for (const project of coreData.projects) {
        items.push({
            id: `project-${project.id}`,
            type: "project",
            text: `New project: ${project.title}`,
            timestamp: project.created_at,
            dateOnly: false,
            href: `/projects/${project.id}`,
        });
    }

    const followUpCutoff = addDaysISO(today, -FOLLOW_UP_AFTER_DAYS);
    for (const client of coreData.clients) {
        if (client.status === "active" && client.last_contact && client.last_contact.slice(0, 10) < followUpCutoff) {
            items.push({
                id: `client-follow-up-${client.id}`,
                type: "client",
                text: `${client.name} is due a follow-up`,
                timestamp: addDaysISO(client.last_contact.slice(0, 10), FOLLOW_UP_AFTER_DAYS),
                dateOnly: true,
                href: `/clients/${client.id}`,
            });
        } else {
            items.push({
                id: `client-${client.id}`,
                type: "client",
                text: `New client: ${client.name}`,
                timestamp: client.created_at,
                dateOnly: false,
                href: `/clients/${client.id}`,
            });
        }
    }

    // Future-dated items (e.g. a follow-up that isn't due yet) aren't activity
    const now = new Date().toISOString();
    return items
        .filter((item) => (item.dateOnly ? item.timestamp <= today : item.timestamp <= now))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit);
}
