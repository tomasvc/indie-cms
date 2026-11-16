import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for the create/edit form pages while their data loads. */
export function FormPageFallback() {
    return (
        <Card className="mx-auto w-full max-w-xl gap-5 p-6" aria-busy="true">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-4 w-64" />
            </div>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            ))}
            <Skeleton className="h-10 w-32 self-end rounded-md" />
        </Card>
    );
}
