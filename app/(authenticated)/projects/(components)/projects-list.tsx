"use client";

import Link from "next/link";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";
import { PROJECT_STATUS_LABEL } from "@/lib/helpers/projects";

interface ProjectsListProps {
    /** Already filtered and sorted by status. */
    projects: Project[];
    clientNames: Record<string, string>;
    locale: string;
    /** Show a heading above each status group. */
    grouped: boolean;
}

export function ProjectsList({ projects, clientNames, locale, grouped }: ProjectsListProps) {
    if (projects.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm">
                No projects match. Try another status or search.
            </div>
        );
    }

    const groups = grouped
        ? projects.reduce<Array<{ status: Project["status"]; projects: Project[] }>>((acc, project) => {
            const last = acc[acc.length - 1];
            if (last?.status === project.status) last.projects.push(project);
            else acc.push({ status: project.status, projects: [project] });
            return acc;
        }, [])
        : [{ status: null, projects }];

    return (
        <div className="flex flex-col gap-6">
            {groups.map((group) => (
                <section key={group.status ?? "all"} aria-label={group.status ? PROJECT_STATUS_LABEL[group.status] : "Projects"}>
                    {group.status && (
                        <h2 className="mb-2.5 flex items-center gap-2 text-[14px] font-semibold text-foreground">
                            {PROJECT_STATUS_LABEL[group.status]}
                            <span className="font-normal text-muted-foreground tabular-nums">{group.projects.length}</span>
                        </h2>
                    )}
                    <ul className="flex flex-col gap-3">
                        {group.projects.map((project) => (
                            <li key={project.id}>
                                <ProjectCard project={project} clientName={clientNames[project.client_id ?? ""]} locale={locale} />
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

function ProjectCard({ project, clientName, locale }: { project: Project; clientName?: string; locale: string }) {
    return (
        <Link href={`/projects/${project.id}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="gap-3 px-5 py-4 transition-shadow hover:ring-foreground/15">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold leading-tight text-foreground">{project.title}</p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            {clientName ?? "No client"}
                            {project.description ? ` · ${project.description}` : ""}
                        </p>
                    </div>
                    <ProjectStatusBadge status={project.status} className="shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px]">
                    <span className="tabular-nums text-foreground">{formatMoney(project.value ?? 0, project.currency, locale)}</span>
                    <span className="text-foreground">{project.due_date ? `Due ${formatLocalDate(project.due_date, locale)}` : "No due date"}</span>
                    <span className="flex min-w-40 flex-1 items-center gap-3">
                        <Progress
                            value={project.progress}
                            aria-label={`${project.title} progress`}
                            className={cn("h-2 flex-1", project.progress >= 100 && "[--progress-background:var(--primary)]")}
                        />
                        <span className="shrink-0 text-muted-foreground text-[13px] tabular-nums">{project.progress}%</span>
                    </span>
                </div>
            </Card>
        </Link>
    );
}
