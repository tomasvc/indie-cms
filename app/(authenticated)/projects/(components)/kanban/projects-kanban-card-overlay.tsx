"use client";

import { Card } from "@/components/ui/card";
import { Project } from "@/types";
import { KanbanCardContent } from "./projects-kanban-card";

export function KanbanCardOverlay({ project }: { project: Project }) {
  return (
    <Card size="sm" className="ring-2 ring-primary/20">
      <KanbanCardContent project={project} />
    </Card>
  );
}
