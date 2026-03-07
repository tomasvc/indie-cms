import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted rounded-[var(--radius)] animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
