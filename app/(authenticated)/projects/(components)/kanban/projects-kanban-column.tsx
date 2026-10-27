"use client";

import { useDroppable } from "@dnd-kit/core";
import { Project } from "@/types";
import { KanbanCard } from "./projects-kanban-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  label: string;
  count: number;
  projects: Project[];
  clientNames: Record<string, string>;
  /** A narrow drop target with no cards, for a column that's filtered out. */
  collapsed?: boolean;
}

export function KanbanColumn({ id, label, count, projects, clientNames, collapsed = false }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  if (collapsed) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 text-center transition-colors",
          isOver && "bg-muted/50 ring-2 ring-primary/30 ring-inset"
        )}
      >
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-[13px] text-muted-foreground">Drop here to archive</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors",
        isOver && "bg-muted/50 ring-2 ring-primary/30 ring-inset"
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-[13px]">{count}</span>
      </div>
      <div ref={setNodeRef} className="flex min-h-[120px] flex-col gap-2 p-2">
        {projects.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-muted-foreground text-[13px]">
            No projects
          </p>
        ) : (
          projects.map((project) => <KanbanCard key={project.id} project={project} clientName={clientNames[project.client_id ?? ""]} />)
        )}
      </div>
    </div>
  );
}
