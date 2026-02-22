import { Suspense } from "react";

async function Earnings() {
    return (
        <div>
            <h1>Earnings coming soon</h1>
        </div>
    )
}

export default function EarningsPage() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Earnings />
        </Suspense>
    );
}