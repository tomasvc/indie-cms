import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: process.env.DEMO_USER_EMAIL!,
        password: process.env.DEMO_USER_PASSWORD!,
    });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const res = NextResponse.redirect(new URL('/dashboard', request.url));
    res.cookies.set("demo", "true", { path: '/', maxAge: 60 * 60 * 24 });
    return res;
}
