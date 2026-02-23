'use client';

import { Project } from "@/types";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsKanban } from "./projects-kanban";
import { ProjectsList } from "./projects-list";
import { ProjectsTable } from "./projects-table";
import { updateProjectStatus } from "@/lib/actions/projects";

interface ProjectsViewProps {
    projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
    const [state, setState] = useState<"list" | "kanban" | "table">("list");
    const handleStatusChange = useCallback(async (projectId: string, status: string) => {
        try {
            await updateProjectStatus(projectId, status);
        } catch (error) {
            console.error(error);
        }
    }, []);

    return (
        <Tabs defaultValue={state} className="flex flex-col gap-4">
            <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
                <ProjectsList projects={projects} />
            </TabsContent>
            <TabsContent value="kanban">
                <ProjectsKanban projects={projects} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="table">
                <ProjectsTable projects={projects} />
            </TabsContent>
        </Tabs>
    )
}