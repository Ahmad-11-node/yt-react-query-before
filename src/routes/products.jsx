import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { SORT_OPTIONS } from "@/lib/api";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { categoriesQuery, PAGE_SIZE, productListQuery } from "@/queries/products";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth for filters, so any result set is shareable
  // and the back button steps through filter changes.
  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Push the debounced value into the URL rather than querying off it directly.
  useEffect(() => {
    if (debouncedSearch === search) return;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("q", debouncedSearch);
        else next.delete("q");
        next.delete("page");
        next.delete("category"); // the API can't combine search with category
        return next;
      },
      { replace: true }
    );
  }, [debouncedSearch, search, setSearchParams]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      return next;
    });
  };

  const { data: categories } = useQuery(categoriesQuery());

  const filters = { search, category, sort, page, limit: PAGE_SIZE };
  const { data, isPending, isError, error, isPlaceholderData, refetch } = useQuery(
    productListQuery(filters)
  );

  const totalPages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1;
  const hasFilters = Boolean(search || category || sort !== "featured");

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-1 text-muted-foreground">
          {data ? `${data.total} products` : "Loading catalogue..."}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products..."
            className="pl-9"
            aria-label="Search products"
          />
          {searchInput && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Clear search"
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
              onClick={() => setSearchInput("")}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>

        <Select
          value={category || "all"}
          onValueChange={(value) => {
            setSearchInput("");
            updateParam("category", value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="sm:w-48" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => updateParam("sort", value)}>
          <SelectTrigger className="sm:w-48" aria-label="Sort products">
            <SlidersHorizontalIcon className="size-4" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {search && <Badge variant="secondary">Search: {search}</Badge>}
          {category && <Badge variant="secondary">{titleCase(category)}</Badge>}
          {sort !== "featured" && (
            <Badge variant="secondary">
              {SORT_OPTIONS.find((option) => option.value === sort)?.label}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not load products</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{error.message}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isPending && <ProductGridSkeleton count={PAGE_SIZE} />}

      {data && data.products.length === 0 && (
        <div className="grid place-items-center gap-3 py-20 text-center">
          <SearchIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">No products match those filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {data && data.products.length > 0 && (
        <>
          {/* isPlaceholderData means we're showing the previous page while the
              next one is in flight — dim it instead of unmounting the grid. */}
          <div
            className={cn(
              "grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4",
              isPlaceholderData && "opacity-60"
            )}
          >
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(next) => {
              updateParam("page", String(next));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // A short sliding window around the current page keeps the control compact.
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => windowStart + i);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>

      {pages.map((number) => (
        <Button
          key={number}
          variant={number === page ? "default" : "ghost"}
          size="sm"
          className="w-9"
          aria-current={number === page ? "page" : undefined}
          onClick={() => onChange(number)}
        >
          {number}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
