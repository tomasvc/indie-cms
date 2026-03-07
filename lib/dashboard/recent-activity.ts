import { createScopedAnimate } from "framer-motion";
import type { DashboardCoreData } from "../queries/dashboard"
import { isAfter } from "date-fns";

export type ActivityItem = {
    id: string;
    type: 'invoice' | 'project' | 'client' | 'task';
    action: 'created' | 'completed' | 'updated' | 'missed contact';
    projectTitle?: string;
    title: string;
    timestamp: string;
    href?: string;
    meta?: string;
}

export function getRecentActivity(coreData: DashboardCoreData, limit = 15): ActivityItem[] {
    const items: ActivityItem[] = [];

    for (const proj of coreData.projects) {
        const created = proj.created_at;
        const updated = proj.updated_at ?? created;
        const isCreated = created === updated;
        const timestamp = updated > created ? updated : created;

        items.push({
            id: `project-${proj.id}`,
            type: "project",
            action: isCreated ? "created" : "updated",
            title: proj.title,
            timestamp,
            href: `/projects${proj.id}`
        })
    }

    for (const client of coreData.clients) {
        const created = client.created_at;
        const updated = client.updated_at ?? created;
        const isCreated = created === updated;
        const isMissedContact = client.last_contact && isAfter(new Date(client.last_contact), new Date());
        const timestamp = isMissedContact ? client.last_contact : updated > created ? updated : created;
        items.push({
            id: `client-${client.id}`,
            type: "client",
            action: isCreated ? "created" : isMissedContact ? "missed contact" : "updated",
            title: client.name,
            timestamp,
            href: "/clients",
        });
    }

    for (const task of coreData.tasks) {
        const completedAt = task.completed_date ?? null;
        const timestamp = completedAt ?? task.created_at;
        items.push({
            id: `task-${task.id}`,
            type: "task",
            action: completedAt ? "completed" : "created",
            projectTitle: coreData.projects.find((p) => p.id === task.project_id)?.title,
            title: task.title,
            timestamp,
            href: `/projects/${task.project_id}`,
        });
    }

    for (const inv of coreData.invoices) {
        const created = inv.created_at;
        const updated = inv.updated_at ?? created;
        const isCreated = created === updated;
        const timestamp = updated > created ? updated : created;
        items.push({
            id: `invoice-${inv.id}`,
            type: "invoice",
            action: inv.status === "paid" && !isCreated ? "completed" : isCreated ? "created" : "updated",
            projectTitle: coreData.projects.find((p) => p.id === inv.project_id)?.title,
            title: `Invoice ${inv.code ?? inv.id.slice(0, 8)}`,
            timestamp,
            href: "/invoices",
        });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, limit);
}