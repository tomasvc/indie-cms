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

export function InvoicesPageFallback() {
    return (
        <div className="flex min-w-0 flex-col gap-4 animate-fadein">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <Card className="flex flex-row gap-10 px-5 py-4">
                {[0, 1].map((i) => (
                    <div key={i}>
                        <Skeleton className="h-3 w-20 mb-2" />
                        <Skeleton className="h-6 w-28 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                ))}
            </Card>
            <Card className="p-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                    <Skeleton className="h-8 w-full sm:w-56" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-8 w-44" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-4">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due date</TableHead>
                            <TableHead>Issue date</TableHead>
                            <TableHead>Paid date</TableHead>
                            <TableHead className="pr-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="pl-4"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
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
}
