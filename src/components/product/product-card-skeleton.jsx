import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-square w-full rounded-md" />
      <div className="pt-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="mt-2 h-3.5 w-full" />
        <Skeleton className="mt-1.5 h-3.5 w-2/3" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Matches the live grid's column counts so the layout doesn't jump on load. */
export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
