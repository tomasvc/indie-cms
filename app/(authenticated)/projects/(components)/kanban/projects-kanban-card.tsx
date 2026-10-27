"use client";

import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate } from "@/lib/helpers/format";

export function KanbanCardContent({
  project,
  clientName,
  onTitleClick,
}: {
  project: Project;
  clientName?: string;
  onTitleClick?: () => void;
}) {
  return (
    <>
      <CardHeader className="pb-1">
        <CardTitle
          className={cn(
            "text-[14px] font-medium normal-case tracking-normal leading-tight",
            onTitleClick && "cursor-pointer hover:underline"
          )}
          onClick={onTitleClick}
        >
          {project.title}
        </CardTitle>
        <p className="truncate text-[13px] text-muted-foreground">{clientName ?? "No client"}</p>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        <div className="flex items-center justify-between text-foreground text-[13px]">
          <span className="tabular-nums">{formatMoney(project.value ?? 0, project.currency)}</span>
          <span>{project.due_date ? `Due ${formatDate(project.due_date, "d MMM")}` : "No due date"}</span>
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
          <span className="shrink-0 text-muted-foreground text-[12px] tabular-nums">
            {project.progress}%
          </span>
        </div>
      </CardContent>
    </>
  );
}

interface KanbanCardProps {
  project: Project;
  clientName?: string;
}

export function KanbanCard({ project, clientName }: KanbanCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    data: { project },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
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
      <KanbanCardContent project={project} clientName={clientName} onTitleClick={() => router.push(`/projects/${project.id}`)} />
    </Card>
  );
}
