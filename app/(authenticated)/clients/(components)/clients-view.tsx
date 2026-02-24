'use client';

import { Client } from "@/types";
import { useCallback, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsList } from "./clients-list";
import { ClientsTable } from "./clients-table";

interface ClientsViewProps {
    clients: Client[];
}

export function ClientsView({ clients }: ClientsViewProps) {
    const [state, setState] = useState<"list" | "kanban" | "table">("list");

    return (
        <Tabs defaultValue={state} className="flex flex-col gap-4">
            <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
                <ClientsList clients={clients} />
            </TabsContent>
            <TabsContent value="table">
                <ClientsTable clients={clients} />
            </TabsContent>
        </Tabs>
    )
}