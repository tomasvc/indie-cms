"use client";

import { useEffect, useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { Project, ProjectStatus } from "@/types";
import { KanbanColumn } from "./kanban/projects-kanban-column";
import { KanbanCard } from "./kanban/projects-kanban-card";
import { KanbanCardOverlay } from "./kanban/projects-kanban-card-overlay";
import type { ActionState } from "@/lib/forms/action-state";

const KANBAN_COLUMNS = [
    { id: "proposal", label: "Proposal" },
    { id: "active", label: "Active" },
    { id: "review", label: "Review" },
    { id: "completed", label: "Completed" },
    { id: "archived", label: "Archived" },
] as const;

export type KanbanStatus = (typeof KANBAN_COLUMNS)[number]["id"];
const KNOWN_STATUSES: Set<string> = new Set(KANBAN_COLUMNS.map((c) => c.id));

interface ProjectsKanbanProps {
    projects: Project[];
    clientNames: Record<string, string>;
    /** When false the Archived column shrinks to a drop target. */
    showArchived: boolean;
    onStatusChange?: (projectId: string, newStatus: string) => Promise<ActionState>;
}

export function ProjectsKanban({ projects, clientNames, showArchived, onStatusChange }: ProjectsKanbanProps) {
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [moveError, setMoveError] = useState<string | null>(null);
    const savingIds = useRef(new Set<string>());

    useEffect(() => {
        setLocalProjects((current) => {
            if (savingIds.current.size === 0) return projects;
            return projects.map((project) =>
                savingIds.current.has(project.id)
                    ? current.find((item) => item.id === project.id) ?? project
                    : project
            );
        });
    }, [projects]);

    const columnsWithProjects = KANBAN_COLUMNS.map((col) => ({
        ...col,
        projects: localProjects.filter((p) => p.status === col.id),
    }));
    const otherProjects = localProjects.filter((p) => !KNOWN_STATUSES.has(p.status));
    const activeProject = activeId ? localProjects.find((p) => p.id === activeId) : null;

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id));
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const projectId = String(active.id);
        const newStatus = String(over.id);
        if (!KNOWN_STATUSES.has(newStatus)) return;

        const project = localProjects.find((p) => p.id === projectId);
        if (!project || project.status === newStatus || savingIds.current.has(projectId)) return;

        const previousStatus = project.status;
        savingIds.current.add(projectId);
        setMoveError(null);
        setLocalProjects((prev) =>
            prev.map((p) =>
                p.id === projectId ? { ...p, status: newStatus as ProjectStatus } : p
            )
        );

        let result: ActionState = { ok: true };
        try {
            result = (await onStatusChange?.(projectId, newStatus)) ?? { ok: true };
        } catch (error) {
            console.error(error);
            result = { error: "Couldn't move this project. Please try again." };
        } finally {
            savingIds.current.delete(projectId);
        }

        if (result.error) {
            setLocalProjects((prev) =>
                prev.map((p) => (p.id === projectId ? { ...p, status: previousStatus } : p))
            );
            setMoveError(result.error);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {moveError && (
                <p className="mb-3 text-sm text-destructive" role="alert">{moveError}</p>
            )}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {columnsWithProjects.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        count={col.projects.length}
                        projects={col.projects}
                        clientNames={clientNames}
                        collapsed={col.id === "archived" && !showArchived}
                    />
                ))}
                {otherProjects.length > 0 && (
                    <div className="flex min-w-[280px] shrink-0 flex-col rounded-lg border border-dashed bg-muted/20">
                        <div className="flex items-center justify-between border-b border-dashed px-3 py-2">
                            <span className="text-sm font-medium text-muted-foreground">Other</span>
                            <span className="text-muted-foreground text-[13px]">{otherProjects.length}</span>
                        </div>
                        <div className="flex flex-col gap-2 p-2">
                            {otherProjects.map((project) => (
                                <KanbanCard key={project.id} project={project} clientName={clientNames[project.client_id ?? ""]} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={null}>
                    {activeProject ? (
                        <div className="min-w-[280px] cursor-grabbing opacity-95 shadow-lg">
                            <KanbanCardOverlay project={activeProject} clientName={clientNames[activeProject.client_id ?? ""]} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

