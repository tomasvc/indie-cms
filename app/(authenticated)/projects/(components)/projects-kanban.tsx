"use client";

import { useEffect, useState } from "react";
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
    onStatusChange?: (projectId: string, newStatus: string) => void;
}

export function ProjectsKanban({ projects, onStatusChange }: ProjectsKanbanProps) {
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        setLocalProjects(projects);
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

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const projectId = String(active.id);
        const newStatus = String(over.id);
        if (!KNOWN_STATUSES.has(newStatus)) return;

        const project = localProjects.find((p) => p.id === projectId);
        if (!project || project.status === newStatus) return;

        setLocalProjects((prev) =>
            prev.map((p) =>
                p.id === projectId ? { ...p, status: newStatus as ProjectStatus } : p
            )
        );
        onStatusChange?.(projectId, newStatus);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {columnsWithProjects.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        count={col.projects.length}
                        projects={col.projects}
                    />
                ))}
                {otherProjects.length > 0 && (
                    <div className="flex min-w-[280px] shrink-0 flex-col rounded-lg border border-dashed bg-muted/20">
                        <div className="flex items-center justify-between border-b border-dashed px-3 py-2">
                            <span className="text-sm font-medium text-muted-foreground">Other</span>
                            <span className="text-muted-foreground text-xs">{otherProjects.length}</span>
                        </div>
                        <div className="flex flex-col gap-2 p-2">
                            {otherProjects.map((project) => (
                                <KanbanCard key={project.id} project={project} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={null}>
                    {activeProject ? (
                        <div className="min-w-[280px] cursor-grabbing opacity-95 shadow-lg">
                            <KanbanCardOverlay project={activeProject} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}

