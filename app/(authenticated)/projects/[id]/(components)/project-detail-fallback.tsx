import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectDetailFallback() {
  return (
    <div className="flex flex-col gap-4 animate-fadein">
      <div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col justify-between mb-2 gap-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1 items-center mb-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Tabs defaultValue="overview" className="flex flex-col gap-4">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <div className="pt-2">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </Tabs>
    </div>
  );
}
