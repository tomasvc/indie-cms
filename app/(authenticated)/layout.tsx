import { ThemeSwitcher } from "@/components/theme-switcher";
import { NavUser } from "@/components/nav-user";
import { SidebarNav } from "@/components/sidebar-nav";
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
import { User } from "@supabase/supabase-js";

async function SidebarUser() {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    const user = data?.claims as unknown as User;
    const { email, full_name } = user.user_metadata;

    return <NavUser user={{ email, full_name }} />;
}

export default async function ProtectedLayout({
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
                            <span className="text-xs font-semibold leading-none tracking-tight">IN</span>
                        </div>
                        <span className="text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                            Indie CMS
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
                            <p className="text-sm font-medium">Indie CMS</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
