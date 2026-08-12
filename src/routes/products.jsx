import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, XIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Page, PageHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  const activeFilters = [
    search && { key: "q", label: `“${search}”` },
    category && { key: "category", label: titleCase(category) },
  ].filter(Boolean);

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const goToPage = (next) => {
    updateParam("page", String(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Page>
      <PageHeader
        title="Shop"
        description={
          data
            ? `${data.total.toLocaleString()} products`
            : "Loading catalogue…"
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
          {searchInput && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="flex gap-3 sm:ml-auto">
          <Select
            value={category || "all"}
            onValueChange={(value) => {
              setSearchInput("");
              updateParam("category", value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter by category">
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
            <SelectTrigger className="w-full sm:w-44" aria-label="Sort products">
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
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
              {filter.label}
              <button
                type="button"
                aria-label={`Remove filter ${filter.label}`}
                className="rounded-sm opacity-60 hover:opacity-100"
                onClick={() => {
                  if (filter.key === "q") setSearchInput("");
                  updateParam(filter.key, "");
                }}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      <Separator className="mt-6" />

      <div className="mt-8">
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t load products</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{error.message}</span>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isPending && <ProductGridSkeleton count={PAGE_SIZE} />}

        {data && data.products.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No matching products</EmptyTitle>
              <EmptyDescription>
                {search
                  ? `Nothing matched “${search}”. Try a shorter or more general term.`
                  : "No products in this category right now."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {data && data.products.length > 0 && (
          <>
            {/* isPlaceholderData means the previous page is still on screen
                while the next one loads — dim it instead of unmounting. */}
            <div
              className={cn(
                "grid grid-cols-2 gap-x-5 gap-y-8 transition-opacity sm:grid-cols-3 lg:grid-cols-4",
                isPlaceholderData && "opacity-50"
              )}
            >
              {data.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <ProductPagination
                page={page}
                totalPages={totalPages}
                onNavigate={goToPage}
              />
            )}
          </>
        )}
      </div>
    </Page>
  );
}

/** Builds a 1 … n-1 n n+1 … last window so the control stays a fixed width. */
function pageWindow(page, totalPages) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];
    return previous && value - previous > 1 ? ["ellipsis", value] : [value];
  });
}

function ProductPagination({ page, totalPages, onNavigate }) {
  const items = pageWindow(page, totalPages);

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (page > 1) onNavigate(page - 1);
            }}
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item);
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (page < totalPages) onNavigate(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
