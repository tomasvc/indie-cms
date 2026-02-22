"use client";

import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface KanbanCardProps {
  project: Project;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

export function KanbanCard({
  project,
  formatCurrency,
  formatDate,
}: KanbanCardProps) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: project.id,
    data: { project },
  });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      size="sm"
      style={style}
      className={cn(
        "cursor-grab transition-shadow hover:ring-foreground/15 active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/projects/${project.id}`)}>
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>{formatCurrency(project.value)}</span>
          <span>Due {formatDate(project.due_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full bg-primary/70 transition-all",
                project.progress >= 100 && "bg-primary"
              )}
              style={{ width: `${Math.min(100, project.progress)}%` }}
            />
          </div>
          <span className="shrink-0 text-muted-foreground text-[10px]">
            {project.progress}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
