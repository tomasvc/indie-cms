"use client";

export default function Error({ error }: { error: Error }) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
        </div>
    )
}