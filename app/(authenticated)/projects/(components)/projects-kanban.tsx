"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Project } from "@/types";
import { createPortal } from "react-dom";
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

const KNOWN_STATUSES = new Set<string>(KANBAN_COLUMNS.map((c) => c.id));

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

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

    const projectsByStatus = useMemo(() => {
        return KANBAN_COLUMNS.map((col) => ({
            ...col,
            projects: localProjects.filter((p) => p.status === col.id),
        }));
    }, [localProjects]);

    const otherProjects = useMemo(
        () =>
            localProjects.filter((p) => !KNOWN_STATUSES.has(p.status)),
        [localProjects]
    );
    const hasOther = otherProjects.length > 0;

    const activeProject = useMemo(
        () => (activeId ? localProjects.find((p) => p.id === activeId) : null),
        [activeId, localProjects]
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
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
                    p.id === projectId ? { ...p, status: newStatus } : p
                )
            );
            onStatusChange?.(projectId, newStatus);
        },
        [localProjects, onStatusChange]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor)
    );

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-2">
                {projectsByStatus.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        label={column.label}
                        count={column.projects.length}
                        projects={column.projects}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                    />
                ))}
                {hasOther && (
                    <div className="flex min-w-[280px] shrink-0 flex-col rounded-lg border border-dashed bg-muted/20">
                        <div className="flex items-center justify-between border-b border-dashed px-3 py-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Other
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {otherProjects.length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 p-2">
                            {otherProjects.map((project) => (
                                <KanbanCard
                                    key={project.id}
                                    project={project}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {typeof document !== "undefined" &&
                createPortal(
                    <DragOverlay dropAnimation={null}>
                        {activeProject ? (
                            <div className="min-w-[280px] cursor-grabbing opacity-95 shadow-lg">
                                <KanbanCardOverlay
                                    project={activeProject}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
        </DndContext>
    );
}

export { formatCurrency, formatDate };
