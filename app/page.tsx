import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function AuthRedirect(): Promise<React.ReactNode> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (data?.claims) {
        redirect("/dashboard");
    } else {
        redirect("/auth/login");
    }
}

export default function RootPage() {
    return (
        <Suspense>
            <AuthRedirect />
        </Suspense>
    );
}
