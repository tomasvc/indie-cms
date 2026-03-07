"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-[state=vertical]:flex-col",
        "data-[state=horizontal]:flex-row",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "font-sans rounded-lg p-[3px] group-data-[state=horizontal]/tabs:h-9 data-[variant=line]:rounded-none data-[variant=line]:p-0 data-[variant=line]:h-auto data-[variant=line]:bg-transparent data-[variant=line]:border-none data-[variant=line]:gap-8 data-[variant=line]:justify-start group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[state=vertical]/tabs:h-fit group-data-[state=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-6 bg-transparent border-b border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "font-sans gap-1.5 rounded-[var(--radius)] border border-transparent px-4 py-2.5 text-[13px] font-medium group-data-vertical/tabs:py-[calc(--spacing(1.25))] [&_svg:not([class*='size-'])]:size-3.5 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-muted-foreground hover:text-foreground transition-colors duration-150 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap",
        "group-data-[state=vertical]/tabs-list:bg-transparent group-data-[state=vertical]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[state=vertical]/tabs-list:data-[state=active]:border-transparent dark:group-data-[state=vertical]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity after:h-px after:rounded-none after:content-['']",
        "group-data-[state=horizontal]/tabs:after:left-0 group-data-[state=horizontal]/tabs:after:right-0 group-data-[state=horizontal]/tabs:after:bottom-0",
        "group-data-[state=vertical]/tabs:after:inset-y-0 group-data-[state=vertical]/tabs:after:-right-1 group-data-[state=vertical]/tabs:after:w-0.5",
        "group-data-[state=vertical]/tabs-list:data-[state=active]:after:opacity-100",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-primary",
        "group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent group-data-[variant=line]/tabs-list:data-[state=active]:text-primary group-data-[variant=line]/tabs-list:dark:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:dark:data-[state=active]:border-transparent",
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:pb-3 group-data-[variant=line]/tabs-list:pt-0 group-data-[variant=line]/tabs-list:after:bottom-0 group-data-[variant=line]/tabs-list:after:left-0 group-data-[variant=line]/tabs-list:after:right-0 group-data-[variant=line]/tabs-list:after:w-full",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("font-sans text-[13px] leading-relaxed flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
