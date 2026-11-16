import { ThemeSwitcher } from "@/components/theme-switcher";
import { NavUser } from "@/components/nav-user";
import { SidebarNav } from "@/components/sidebar-nav";
import { DemoBanner } from "@/components/demo-banner";
import { QueryProvider } from "@/components/query-provider";
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

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <SidebarProvider>
                <Sidebar collapsible="icon" className="print:hidden">
                    <SidebarHeader>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                        >
                            <div className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md shrink-0">
                                <span className="text-[13px] font-semibold leading-none tracking-tight">OS</span>
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
                        <NavUser />
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                <SidebarInset>
                    <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur print:hidden">
                        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger />
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeSwitcher />
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 min-w-0 p-4 sm:p-6 max-w-[1600px] w-full mx-auto print:p-0">
                        <div className="print:hidden">
                            <DemoBanner />
                        </div>
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </QueryProvider>
    );
}
