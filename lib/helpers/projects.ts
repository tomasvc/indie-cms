import type { Project } from "@/types";

/** Order a freelancer scans projects in: live work first, finished and shelved work last. */
export const PROJECT_STATUS_ORDER: Record<Project["status"], number> = {
    active: 0,
    review: 1,
    on_hold: 2,
    proposal: 3,
    draft: 4,
    completed: 5,
    archived: 6,
};

export const PROJECT_STATUS_LABEL: Record<Project["status"], string> = {
    active: "Active",
    review: "In review",
    on_hold: "On hold",
    proposal: "Proposal",
    draft: "Draft",
    completed: "Completed",
    archived: "Archived",
};

/** By status, then soonest due date (undated last), then title. */
export function sortProjects<T extends Pick<Project, "status" | "due_date" | "title">>(projects: T[]) {
    return [...projects].sort(
        (a, b) =>
            (PROJECT_STATUS_ORDER[a.status] ?? 9) - (PROJECT_STATUS_ORDER[b.status] ?? 9) ||
            (a.due_date || "9999").localeCompare(b.due_date || "9999") ||
            a.title.localeCompare(b.title)
    );
}
