import { ONBOARDING_DONE_COOKIE } from "@/lib/supabase/proxy";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const res = NextResponse.redirect(new URL('/auth/login', request.url));
    res.cookies.set("demo", "", { path: "/", maxAge: 0 });
    res.cookies.set(ONBOARDING_DONE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
}