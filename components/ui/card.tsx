import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "bg-card text-card-foreground border border-border rounded-[calc(var(--radius)*1.4)] shadow-[var(--c-shadow)] overflow-hidden gap-0 text-sm font-sans has-[>img:first-child]:pt-0 data-[size=sm]:gap-0 *:[img:first-child]:rounded-t-[calc(var(--radius)*1.4)] *:[img:last-child]:rounded-b-[calc(var(--radius)*1.4)] group/card flex flex-col",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-0.5 rounded-t-[calc(var(--radius)*1.4)] px-5 pt-4 pb-3.5 border-b border-border group-data-[size=sm]/card:px-3 [.border-b]:pb-3.5 group-data-[size=sm]/card:[.border-b]:pb-3.5 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-[15px] font-semibold text-foreground font-sans", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-[14px] leading-relaxed font-sans", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 py-4 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("rounded-b-[calc(var(--radius)*1.4)] px-5 pt-3 group-data-[size=sm]/card:px-3 [.border-t]:pt-3 pb-3 group-data-[size=sm]/card:[.border-t]:pt-3 flex items-center border-t border-border bg-muted/50", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
