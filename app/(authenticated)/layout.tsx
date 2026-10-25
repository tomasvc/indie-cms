import { ThemeSwitcher } from "@/components/theme-switcher";
import { NavUser } from "@/components/nav-user";
import { SidebarNav } from "@/components/sidebar-nav";
import { DismissableDemoBanner } from "@/components/demo-banner";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function SidebarUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const demo = Boolean(user.is_anonymous);
    const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

    return (
        <NavUser
            user={{ email: user.email ?? "", full_name: fullName || (demo ? "Alex Rivera" : "") }}
            demo={demo}
        />
    );
}

async function DemoBanner() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.is_anonymous) return null;
    return <DismissableDemoBanner />;
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                    >
                        <div className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md shrink-0">
                            <span className="text-xs font-semibold leading-none tracking-tight">OS</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                            Freelance OS
                        </span>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <Suspense fallback={null}>
                        <SidebarNav />
                    </Suspense>
                </SidebarContent>

                <SidebarFooter>
                    <Suspense fallback={null}>
                        <SidebarUser />
                    </Suspense>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
                    <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <p className="text-sm font-medium">Freelance OS</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
                    <Suspense fallback={null}>
                        <DemoBanner />
                    </Suspense>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
