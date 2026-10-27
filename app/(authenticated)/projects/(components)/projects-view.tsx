'use client';

import { Project } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectsKanban } from "./projects-kanban";
import { ProjectsList } from "./projects-list";
import { ProjectsTable } from "./projects-table";
import { updateProjectStatus } from "@/lib/actions/projects";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_ORDER, sortProjects } from "@/lib/helpers/projects";
import { getStoredProjectsView, type ProjectsViewType } from "./projects-fallback";

const PROJECTS_VIEW_KEY = "projects-view";

/** "open" hides archived work, which is rarely what you're looking for. */
type StatusFilter = "open" | "all" | Project["status"];

const STATUSES = Object.keys(PROJECT_STATUS_ORDER) as Project["status"][];

interface ProjectsViewProps {
    projects: Project[];
    /** Display name per client id. */
    clientNames: Record<string, string>;
    locale: string;
}

export function ProjectsView({ projects, clientNames, locale }: ProjectsViewProps) {
    // Unknown until the stored choice is read, so the wrong view doesn't flash first
    const [view, setView] = useState<ProjectsViewType | null>(null);
    const [status, setStatus] = useState<StatusFilter>("open");
    const [query, setQuery] = useState("");

    useEffect(() => {
        setView(getStoredProjectsView());
    }, []);

    const handleTabChange = useCallback((value: string) => {
        const v = value as ProjectsViewType;
        setView(v);
        try {
            window.localStorage.setItem(PROJECTS_VIEW_KEY, v);
        } catch {
            // Storage can be unavailable (private mode); the choice just isn't remembered
        }
    }, []);

    const handleStatusChange = useCallback(async (projectId: string, newStatus: string) => {
        return updateProjectStatus(projectId, newStatus);
    }, []);

    const visibleProjects = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return sortProjects(
            projects.filter((project) => {
                if (status === "open" && project.status === "archived") return false;
                if (status !== "open" && status !== "all" && project.status !== status) return false;
                if (!needle) return true;
                const haystack = [project.title, project.description, clientNames[project.client_id ?? ""], project.category]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(needle);
            })
        );
    }, [clientNames, projects, query, status]);

    const hiddenArchived = status === "open" ? projects.filter((project) => project.status === "archived").length : 0;

    return (
        <Tabs value={view ?? ""} onValueChange={handleTabChange} className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <div className="relative w-full sm:ml-auto sm:w-56">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search projects or clients"
                        aria-label="Search projects"
                        className="pl-8"
                    />
                </div>
                <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                    <SelectTrigger aria-label="Filter by status" className="w-full sm:w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                        <SelectItem value="open">All but archived</SelectItem>
                        <SelectItem value="all">All projects</SelectItem>
                        {STATUSES.map((value) => (
                            <SelectItem key={value} value={value}>{PROJECT_STATUS_LABEL[value]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {hiddenArchived > 0 && view !== "kanban" && (
                <p className="-mt-2 text-[13px] text-muted-foreground">
                    {hiddenArchived} archived {hiddenArchived === 1 ? "project is" : "projects are"} hidden.{" "}
                    <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setStatus("all")}>
                        Show all
                    </button>
                </p>
            )}
            <TabsContent value="list" className="min-w-0">
                <ProjectsList projects={visibleProjects} clientNames={clientNames} locale={locale} grouped={status === "open" || status === "all"} />
            </TabsContent>
            <TabsContent value="kanban" className="min-w-0">
                <ProjectsKanban projects={visibleProjects} clientNames={clientNames} showArchived={status !== "open"} onStatusChange={handleStatusChange} />
            </TabsContent>
            <TabsContent value="table" className="min-w-0">
                <ProjectsTable projects={visibleProjects} clientNames={clientNames} locale={locale} />
            </TabsContent>
        </Tabs>
    )
}
