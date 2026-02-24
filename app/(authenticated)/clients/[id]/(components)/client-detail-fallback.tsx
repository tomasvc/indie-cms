import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailFallback() {
  return (
    <div className="flex flex-col gap-4 animate-fadein">
      <Skeleton className="h-9 w-48" />
    </div>
  );
}
