"use client";

import { Card } from "@/components/ui/card";
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
          <Card className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
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
          <TableHead>Company</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Billed</TableHead>
          <TableHead>Owed</TableHead>
          <TableHead>Last contact</TableHead>
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
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
