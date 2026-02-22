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
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

export function KanbanColumn({
  id,
  label,
  count,
  projects,
  formatCurrency,
  formatDate,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex min-w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors",
        isOver && "bg-muted/50 ring-2 ring-primary/30 ring-inset"
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[120px] flex-col gap-2 p-2"
      >
        {projects.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-muted-foreground text-xs">
            No projects
          </p>
        ) : (
          projects.map((project) => (
            <KanbanCard
              key={project.id}
              project={project}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}
