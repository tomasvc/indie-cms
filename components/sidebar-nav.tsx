"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BriefcaseBusiness,
  Clock,
  FileText,
  Folder,
  Home,
  Receipt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Projects", href: "/projects", icon: Folder },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Invoices", href: "/invoices", icon: Receipt },
  { label: "Time & Earnings", href: "/earnings", icon: Clock },
  { label: "Portfolio", href: "/portfolio", icon: BriefcaseBusiness },
];

const AITools = [
  { label: "AI Proposal", href: "/ai/proposal-generator", icon: FileText },
  { label: "Invoice Creator", href: "/ai/invoice-creator", icon: Receipt },
  { label: "Project Estimator", href: "/ai/project-estimator", icon: Clock },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {AITools.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
