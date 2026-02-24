"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

const PROJECTS_VIEW_KEY = "projects-view";

function ProjectsListFallback() {
  return (
    <ul className="flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <li key={i}>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-[320px]" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function ProjectsKanbanFallback() {
  const columns = [
    "Proposal",
    "Active",
    "Review",
    "Completed",
    "Archived",
  ];
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex min-w-[280px] shrink-0 flex-col rounded-lg border bg-muted/30"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="flex min-h-[120px] flex-col gap-2 p-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} size="sm">
                <CardHeader className="pb-1">
                  <Skeleton className="h-3 w-32" />
                </CardHeader>
                <CardContent className="space-y-1.5 pt-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-1.5 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-6 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsTableFallback() {
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
        {[...Array(6)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
            <TableCell><Skeleton className="h-4 w-14" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export type ProjectsViewType = "list" | "kanban" | "table";

export function getStoredProjectsView(): ProjectsViewType {
  if (typeof window === "undefined") return "list";
  const stored = window.localStorage.getItem(PROJECTS_VIEW_KEY);
  if (stored === "list" || stored === "kanban" || stored === "table")
    return stored;
  return "list";
}

export function ProjectsPageFallback() {
  const [view, setView] = useState<ProjectsViewType>("list");

  useEffect(() => {
    setView(getStoredProjectsView());
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-fadein">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <Tabs value={view} className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        {view === "list" && <ProjectsListFallback />}
        {view === "kanban" && <ProjectsKanbanFallback />}
        {view === "table" && <ProjectsTableFallback />}
      </Tabs>
    </div>
  );
}
