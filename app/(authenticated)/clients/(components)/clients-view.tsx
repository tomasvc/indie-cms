'use client';

import { Client } from "@/types";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsList } from "./clients-list";
import { ClientsTable } from "./clients-table";
import { getStoredClientsView, type ClientsViewType } from "./clients-fallback";

const CLIENTS_VIEW_KEY = "clients-view";

interface ClientsViewProps {
    clients: Client[];
}

export function ClientsView({ clients }: ClientsViewProps) {
    const [state, setState] = useState<"list" | "table">("list");

    useEffect(() => {
        const stored = getStoredClientsView();
        setState(stored);
    }, []);

    const handleTabChange = (value: string) => {
        const v = value as ClientsViewType;
        setState(v);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(CLIENTS_VIEW_KEY, v);
        }
    };

    return (
        <Tabs value={state} onValueChange={handleTabChange} className="flex flex-col gap-4">
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