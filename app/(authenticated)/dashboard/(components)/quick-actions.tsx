import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Typography } from "../../../../components/ui/typography";
import { FolderPlus, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { CreateInvoiceDialog } from "@/app/(authenticated)/invoices/(components)/create-invoice-dialog";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export async function QuickActions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }
    const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id);
    const { data: clients } = await supabase.from('clients').select('*').eq('user_id', user.id);
    if (!projects || !clients) {
        notFound();
    }
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Quick Actions</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your quick actions.</Typography></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <CreateInvoiceDialog
                        trigger={
                            <Button variant="outline" size="lg" disabled={projects.length === 0 || clients.length === 0} className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted cursor-pointer disabled:cursor-not-allowed">
                                <Receipt />
                                <span className="flex flex-col items-start">
                                    <Typography variant="label" as="span" className="text-left">Create New Invoice</Typography>
                                    <Typography variant="bodySmall" color="muted" as="span" className="text-left">Create and send an invoice</Typography>
                                </span>
                            </Button>
                        }
                        projects={projects}
                        clients={clients}
                    />
                    <Button variant="outline" size="lg" className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted" asChild>
                        <Link href="/projects/new">
                            <FolderPlus />
                            <span className="flex flex-col items-start">
                                <Typography variant="label" as="span" className="text-left">New Project</Typography>
                                <Typography variant="bodySmall" color="muted" as="span" className="text-left">Start a new project workspace</Typography>
                            </span>
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}