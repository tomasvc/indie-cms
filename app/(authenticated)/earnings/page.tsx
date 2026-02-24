import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function Earnings() {
    return (
        <div>
            <h1>Earnings coming soon</h1>
        </div>
    )
}

function EarningsFallback() {
    return (
        <div className="flex flex-col gap-4 animate-fadein">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-4 w-64" />
        </div>
    );
}

export default function EarningsPage() {
    return (
        <Suspense fallback={<EarningsFallback />}>
            <Earnings />
        </Suspense>
    );
}