"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

interface ProjectsTableProps {
    projects: Project[];
}

function openRow(event: KeyboardEvent<HTMLTableRowElement>, open: () => void) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    open();
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const router = useRouter();
    return (
        <Card className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-4">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="pr-4">Completed Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
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
                            <TableCell><Badge variant="outline" className="capitalize">{project.status}</Badge></TableCell>
                            <TableCell>{project.progress}</TableCell>
                            <TableCell>{project.value}</TableCell>
                            <TableCell>{project.start_date}</TableCell>
                            <TableCell>{project.due_date}</TableCell>
                            <TableCell className="pr-4">{project.completed_date}</TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    )
}