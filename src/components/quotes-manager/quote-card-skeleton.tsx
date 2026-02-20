import { Skeleton } from "@/components/ui/skeleton";

export function QuoteCardSkeleton() {
  return (
    <div className="bg-background-elevated border border-background-muted rounded-lg p-6 flex flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[75%]" />
      </div>

      <div className="flex flex-col gap-2 border-t border-background-muted pt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3.5 w-[60%]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3.5 w-[40%]" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-background-muted pt-4">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}
