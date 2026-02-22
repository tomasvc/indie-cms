"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanCardOverlayProps {
  project: Project;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

export function KanbanCardOverlay({
  project,
  formatCurrency,
  formatDate,
}: KanbanCardOverlayProps) {
  return (
    <Card size="sm" className="ring-2 ring-primary/20">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium leading-tight">
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
