import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Page, PageHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
import {
  ProductCardSkeleton,
  ProductGridSkeleton,
} from "@/components/product/product-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <Page>
      <PageHeader
        title="Infinite scroll"
        description={
          total
            ? `${products.length} of ${total} products loaded`
            : "Loading catalogue…"
        }
      />

      <Separator className="mt-6" />

      <div className="mt-8">
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t load products</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {isPending ? (
          <ProductGridSkeleton count={PAGE_SIZE} />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Skeletons in the grid rather than a detached spinner, so the
                page keeps its shape while the next batch arrives. */}
            {isFetchingNextPage &&
              Array.from({ length: 4 }, (_, index) => (
                <ProductCardSkeleton key={`next-${index}`} />
              ))}
          </div>
        )}

        <div ref={sentinelRef} className="flex justify-center py-10">
          {!isPending && !isFetchingNextPage && hasNextPage && (
            <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
              Load more
            </Button>
          )}
          {!hasNextPage && products.length > 0 && (
            <p className="text-sm text-muted-foreground">
              All {total} products loaded.
            </p>
          )}
        </div>
      </div>
    </Page>
  );
}
