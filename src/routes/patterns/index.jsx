import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Page, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const patterns = [
  {
    title: "Paginated queries",
    api: "placeholderData: keepPreviousData",
    description:
      "Holds the current page on screen while the next one loads, so the grid dims instead of collapsing into skeletons.",
    usedIn: "The shop grid",
    to: "/products?page=2",
    code: `useQuery({
  queryKey: ["products", "list", filters],
  queryFn: () => api.getProducts(filters),
  placeholderData: keepPreviousData,
})`,
  },
  {
    title: "Infinite queries",
    api: "useInfiniteQuery",
    description:
      "Accumulates pages into one flat list, with an IntersectionObserver sentinel requesting the next page before the user reaches the bottom.",
    usedIn: "The infinite scroll page",
    to: "/infinite",
    code: `useInfiniteQuery({
  queryKey: ["products", "infinite", filters],
  queryFn: ({ pageParam }) => api.getProducts({ page: pageParam }),
  initialPageParam: 1,
  getNextPageParam: (last, all) =>
    loaded < last.total ? all.length + 1 : undefined,
})`,
  },
  {
    title: "Parallel queries",
    api: "useQueries",
    description:
      "Runs one request per featured category at the same time, for a list whose length isn't known when the component is written.",
    usedIn: "The home page category rails",
    to: "/patterns/parallel",
    code: `useQueries({
  queries: categories.map((slug) =>
    productListQuery({ category: slug })
  ),
})`,
  },
  {
    title: "Dependent queries",
    api: "enabled",
    description:
      "The related-products query is gated until the product loads and tells it which category to fetch. Without the gate it fires with an undefined id.",
    usedIn: "Related items on a product page",
    to: "/patterns/dependant",
    code: `useQuery({
  ...productListQuery({ category: product?.category }),
  enabled: Boolean(product?.category),
})`,
  },
  {
    title: "Optimistic updates",
    api: "onMutate / onError rollback",
    description:
      "Writes to the cache before the server answers, snapshots the previous value, and rolls back if the request fails.",
    usedIn: "Posting a product review",
    to: "/patterns/optimistic",
    code: `onMutate: async (next) => {
  await queryClient.cancelQueries({ queryKey: key })
  const previous = queryClient.getQueryData(key)
  queryClient.setQueryData(key, (old) => merge(old, next))
  return { previous }
},
onError: (_e, _v, ctx) =>
  queryClient.setQueryData(key, ctx.previous),`,
  },
  {
    title: "Prefetching",
    api: "queryClient.prefetchQuery",
    description:
      "Hovering a product card warms its detail query, so opening the product usually renders straight from cache with no spinner.",
    usedIn: "Every product card",
    to: "/products",
    code: `onMouseEnter={() =>
  queryClient.prefetchQuery(
    productDetailQuery(product.id)
  )
}`,
  },
];

export default function PatternsPage() {
  return (
    <Page>
      <PageHeader
        title="Query patterns"
        description="Each pattern below is used somewhere in the storefront rather than only in isolation. Run the project locally to watch the cache update live in the React Query devtools."
      />

      <Separator className="mt-6" />

      <dl className="mt-2">
        {patterns.map((pattern) => (
          <div
            key={pattern.title}
            className="grid gap-x-10 gap-y-4 border-b py-8 last:border-0 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
          >
            <div>
              <dt className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-base font-medium tracking-tight">
                  {pattern.title}
                </span>
                <code className="font-mono text-xs text-muted-foreground">
                  {pattern.api}
                </code>
              </dt>

              <dd className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {pattern.description}
              </dd>

              <dd className="mt-4 flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  Used in {pattern.usedIn}
                </span>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link to={pattern.to}>
                    See it
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </dd>
            </div>

            <dd className="min-w-0">
              <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">
                <code>{pattern.code}</code>
              </pre>
            </dd>
          </div>
        ))}
      </dl>
    </Page>
  );
}
