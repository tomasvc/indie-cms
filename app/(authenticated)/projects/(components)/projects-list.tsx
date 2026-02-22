"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

interface ProjectsListProps {
    projects: Project[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
    const router = useRouter();

    if (projects.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
                No projects yet.
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {projects.map((project) => (
                <li key={project.id}>
                    <Card className="transition-shadow hover:ring-foreground/15 cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                                <CardTitle className="text-base font-semibold leading-tight">
                                    {project.title}
                                </CardTitle>
                                {project.description ? (
                                    <p className="text-muted-foreground line-clamp-2 text-sm">
                                        {project.description}
                                    </p>
                                ) : null}
                            </div>
                            <Badge variant="outline" className="shrink-0 capitalize">
                                {project.status.replace("_", " ")}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
                                <span>{formatCurrency(project.value)}</span>
                                <span>Due {formatDate(project.due_date)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Progress
                                    value={project.progress}
                                    className={cn(
                                        "h-2 flex-1",
                                        project.progress >= 100 && "[--progress-background:var(--primary)]"
                                    )}
                                />
                                <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                                    {project.progress}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </li>
            ))}
        </ul>
    );
}
