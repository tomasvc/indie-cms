import { Suspense } from "react";
import { getInvoices } from "@/lib/actions/invoices";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";
import { InvoicesTable } from "./(components)/invoices-table";
import { getProjects } from "@/lib/actions/projects";
import { getClients } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

async function InvoicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }
    const projects = await getProjects(user.id);
    const clients = await getClients();
    const invoices = await getInvoices(user.id);
    if (!invoices) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your invoices.
                    </p>
                </div>
                <div>
                    <CreateInvoiceDialog
                        trigger={
                            <Button size="lg" variant="default" >
                                <PlusIcon className="size-3 mb-0.5" />
                                New Invoice
                            </Button>
                        }
                        projects={projects}
                        clients={clients}
                    />
                </div>
            </div>
            <InvoicesTable invoices={invoices} />
        </div>
    )
}

export default function Invoices() {
    return (
        <Suspense fallback={<Fallback />}>
            <InvoicesPage />
        </Suspense>
    );
}

const Fallback = () => {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Card className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Paid Date</TableHead>
                            <TableHead className="pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="pl-4"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="pr-4 text-right"><Skeleton className="h-8 w-8 rounded" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};