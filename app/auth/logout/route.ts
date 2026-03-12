import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const res = NextResponse.redirect(new URL('/auth/login', request.url));
    res.cookies.set("demo", "false", { path: '/', maxAge: 60 * 60 * 24 });
    return res;
}