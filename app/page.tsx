import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function RootPage() {
    await connection();
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (data?.claims) {
        redirect("/dashboard");
    } else {
        redirect("/auth/login");
    }
}
