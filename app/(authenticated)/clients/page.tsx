import { Suspense } from "react";

async function Clients() {
    return (
        <div>
            <h1>Clients coming soon</h1>
        </div>
    )
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<div className="h-24 animate-pulse rounded-md border" />}>
            <Clients />
        </Suspense>
    );
}