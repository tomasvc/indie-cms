import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // A signed-in visitor keeps their own session. Everyone else gets a fresh sandbox.
    if (!user) {
        const { error } = await supabase.auth.signInAnonymously({
            options: { data: { full_name: "Alex Rivera" } },
        });
        if (error) redirect("/auth/login?demo_error=unavailable");

        const { error: seedError } = await supabase.rpc("seed_demo_workspace");
        if (seedError) {
            await supabase.auth.signOut();
            redirect("/auth/login?demo_error=unavailable");
        }
    }

    const cookieStore = await cookies();
    cookieStore.set("demo", "", { path: "/", maxAge: 0 });
    redirect("/dashboard");
}
