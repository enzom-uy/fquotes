import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

interface QuoteSkeletonProps {
  count: number;
  processed: number;
}

const SingleQuoteSkeleton = () => (
  <div className="flex flex-col gap-3">
    {/* Image preview skeleton */}
    <Skeleton className="w-full aspect-[4/3] rounded-lg" />

    {/* Book search skeleton */}
    <Skeleton className="w-full h-9 rounded-md" />

    {/* Quote card skeleton */}
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Quote text */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Chapter input */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        {/* Tags input */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        {/* Switch row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-9 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const QuoteSkeletons = ({ count, processed }: QuoteSkeletonProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-foreground-muted">
        Processing images... {processed}/{count}
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SingleQuoteSkeleton key={i} />
      ))}
    </div>
  </div>
);
