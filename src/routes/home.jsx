import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { titleCase } from "@/lib/format";
import { categoriesQuery, productListQuery } from "@/queries/products";

const FEATURED_CATEGORIES = ["smartphones", "laptops", "fragrances", "furniture"];

export default function HomePage() {
  const { data: categories, isPending: categoriesPending } = useQuery(categoriesQuery());

  const { data: topRated, isPending: topRatedPending } = useQuery(
    productListQuery({ sort: "rating-desc", limit: 8, page: 1 })
  );

  /**
   * Parallel queries: one request per featured category, all in flight at
   * once. useQueries handles a list whose length isn't known at compile time.
   */
  const categoryPreviews = useQueries({
    queries: FEATURED_CATEGORIES.map((slug) =>
      productListQuery({ category: slug, limit: 4, page: 1 })
    ),
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <SparklesIcon className="size-3" />
            Built with TanStack Query v5
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            A storefront that stays fast under your thumb
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Cached, prefetched and optimistically updated. Browse nearly 200
            products with instant filtering, sorting and pagination.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/products">
                Start shopping
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/patterns">See the query patterns</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold">Shop by category</h2>

        {categoriesPending ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories?.slice(0, 12).map((category) => (
              <Link key={category.slug} to={`/products?category=${category.slug}`}>
                <Card className="h-full py-0 transition-colors hover:border-primary hover:bg-accent">
                  <CardContent className="grid h-16 place-items-center p-3 text-center text-sm font-medium">
                    {category.name}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Top rated */}
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Top rated</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products?sort=rating-desc">
              View all
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>

        {topRatedPending ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {topRated?.products?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* One row per featured category, each from its own parallel query */}
      {FEATURED_CATEGORIES.map((slug, index) => {
        const result = categoryPreviews[index];

        return (
          <section key={slug} className="mx-auto max-w-7xl px-4 pb-14">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{titleCase(slug)}</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/products?category=${slug}`}>
                  View all
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </div>

            {result.isPending ? (
              <ProductGridSkeleton count={4} />
            ) : result.isError ? (
              <p className="text-sm text-destructive">{result.error.message}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {result.data?.products?.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
