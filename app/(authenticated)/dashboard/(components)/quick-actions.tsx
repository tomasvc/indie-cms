import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Typography } from "../../../../components/ui/typography";
import { FolderPlus, Receipt } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle><Typography variant="cardTitle" as="span">Quick Actions</Typography></CardTitle>
                <CardDescription><Typography variant="body" color="muted" as="span">This is a summary of your quick actions.</Typography></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="lg" className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted" asChild>
                        <Link href="/invoices/new">
                            <Receipt />
                            <span className="flex flex-col items-start">
                                <Typography variant="label" as="span" className="text-left">Create New Invoice</Typography>
                                <Typography variant="bodySmall" color="muted" as="span" className="text-left">Create and send an invoice</Typography>
                            </span>
                        </Link>
                    </Button>
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