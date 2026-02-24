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

const CLIENTS_VIEW_KEY = "clients-view";

function ClientsListFallback() {
  return (
    <ul className="flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <li key={i}>
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full max-w-[280px]" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function ClientsTableFallback() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total Billed</TableHead>
          <TableHead>Last Contact</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(6)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export type ClientsViewType = "list" | "table";

export function getStoredClientsView(): ClientsViewType {
  if (typeof window === "undefined") return "list";
  const stored = window.localStorage.getItem(CLIENTS_VIEW_KEY);
  if (stored === "list" || stored === "table") return stored;
  return "list";
}

export function ClientsPageFallback() {
  const [view, setView] = useState<ClientsViewType>("list");

  useEffect(() => {
    setView(getStoredClientsView());
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-fadein">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <Tabs value={view} className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
        {view === "list" && <ClientsListFallback />}
        {view === "table" && <ClientsTableFallback />}
      </Tabs>
    </div>
  );
}
