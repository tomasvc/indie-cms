import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function AuthRedirect(): Promise<React.ReactNode> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const demo = (await cookies()).get("demo")?.value === "true";

    if (data?.claims || demo) {
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
