"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ProjectsTableProps {
    projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
    const router = useRouter();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Completed Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects.map((project) => (
                    <TableRow key={project.id} onClick={() => router.push(`/projects/${project.id}`)} className="cursor-pointer hover:bg-muted">
                        <TableCell>{project.title}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{project.status}</Badge></TableCell>
                        <TableCell>{project.progress}</TableCell>
                        <TableCell>{project.value}</TableCell>
                        <TableCell>{project.start_date}</TableCell>
                        <TableCell>{project.due_date}</TableCell>
                        <TableCell>{project.completed_date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}