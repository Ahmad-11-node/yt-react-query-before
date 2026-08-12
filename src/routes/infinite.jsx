import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { infiniteProductsQuery, PAGE_SIZE } from "@/queries/products";

export default function InfinitePage() {
  const {
    data,
    error,
    isError,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(infiniteProductsQuery({ sort: "featured" }));

  const sentinelRef = useRef(null);

  // Fetch the next page when the sentinel scrolls into view. The guard matters:
  // without it the observer fires repeatedly while a request is already open.
  const handleIntersect = useCallback(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const products = data?.pages.flatMap((page) => page.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Infinite scroll</h1>
        <p className="mt-1 text-muted-foreground">
          {products.length} of {total} products loaded with{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            useInfiniteQuery
          </code>
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load products</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isPending ? (
        <ProductGridSkeleton count={PAGE_SIZE} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="grid place-items-center py-10">
        {isFetchingNextPage ? (
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        ) : hasNextPage ? (
          <Button variant="outline" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        ) : (
          products.length > 0 && (
            <p className="text-sm text-muted-foreground">
              That&apos;s everything — {total} products.
            </p>
          )
        )}
      </div>
    </div>
  );
}
