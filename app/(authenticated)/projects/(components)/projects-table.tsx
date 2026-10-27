"use client";

import { Card } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { formatLocalDate, formatMoney } from "@/lib/helpers/format";

interface ProjectsTableProps {
    /** Already filtered and sorted. */
    projects: Project[];
    clientNames: Record<string, string>;
    locale: string;
}

function openRow(event: KeyboardEvent<HTMLTableRowElement>, open: () => void) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
}

export function ProjectsTable({ projects, clientNames, locale }: ProjectsTableProps) {
    const router = useRouter();
    const date = (value?: string | null) => (value ? formatLocalDate(value, locale) : "—");
    return (
        <Card className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4">Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead>Start date</TableHead>
                        <TableHead>Due date</TableHead>
                        <TableHead className="pr-4">Completed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.length === 0 && (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No projects match. Try another status or search.</TableCell>
                        </TableRow>
                    )}
                    {projects.map((project) => {
                        const href = `/projects/${project.id}`;
                        return (
                        <TableRow
                            key={project.id}
                            tabIndex={0}
                            className="cursor-pointer hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            onClick={() => router.push(href)}
                            onKeyDown={(event) => openRow(event, () => router.push(href))}
                        >
                            <TableCell className="pl-4">
                                <Link href={href} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={(event) => event.stopPropagation()}>
                                    {project.title}
                                </Link>
                            </TableCell>
                            <TableCell>{clientNames[project.client_id ?? ""] ?? "—"}</TableCell>
                            <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                            <TableCell className="text-right tabular-nums">{project.progress}%</TableCell>
                            <TableCell className="text-right tabular-nums">{formatMoney(project.value ?? 0, project.currency, locale)}</TableCell>
                            <TableCell>{date(project.start_date)}</TableCell>
                            <TableCell>{date(project.due_date)}</TableCell>
                            <TableCell className="pr-4">{date(project.completed_date)}</TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    )
}
