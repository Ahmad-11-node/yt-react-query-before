import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { PromoTiles } from "@/components/home/promo-tiles";
import { Page, SectionHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Button } from "@/components/ui/button";
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
    <Page className="py-10">
      {/* The banner carries the headline, so the page needs only an
          accessible title above it rather than a second visible one. */}
      <h1 className="sr-only">Cachely</h1>
      <HeroCarousel />

      {/* Categories as plain links rather than a grid of cards. */}
      <section className="mt-8">
        <SectionHeader title="Categories" />
        <div className="mt-4 flex flex-wrap gap-2">
          {categoriesPending
            ? Array.from({ length: 14 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-28 rounded-md" />
              ))
            : categories?.map((category) => (
                <Button
                  key={category.slug}
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-normal"
                >
                  <Link to={`/products?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </Button>
              ))}
        </div>
      </section>

      <ProductRail
        title="Top rated"
        to="/products?sort=rating-desc"
        isPending={topRatedPending}
        products={topRated?.products}
      />

      {/* Breaks up the run of product rails so the page isn't one repeated
          shape from top to bottom. */}
      <section className="mt-12">
        <PromoTiles />
      </section>

      {/* One rail per featured category, each from its own parallel query. */}
      {FEATURED_CATEGORIES.map((slug, index) => {
        const result = categoryPreviews[index];

        return (
          <ProductRail
            key={slug}
            title={titleCase(slug)}
            to={`/products?category=${slug}`}
            isPending={result.isPending}
            error={result.error}
            products={result.data?.products}
          />
        );
      })}
    </Page>
  );
}

function ProductRail({ title, to, isPending, error, products }) {
  return (
    <section className="mt-12">
      <SectionHeader
        title={title}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to={to}>
              View all
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />

      <div className="mt-4">
        {isPending ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load this section.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products?.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
