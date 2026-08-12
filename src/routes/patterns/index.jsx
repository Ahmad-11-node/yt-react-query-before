import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const patterns = [
  {
    title: "Paginated queries",
    hook: "placeholderData: keepPreviousData",
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
    hook: "useInfiniteQuery",
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
    hook: "useQueries",
    description:
      "Runs one request per featured category at the same time, for a list whose length isn't known when the component is written.",
    usedIn: "The home page category rows",
    to: "/patterns/parallel",
    code: `useQueries({
  queries: categories.map((slug) =>
    productListQuery({ category: slug })
  ),
})`,
  },
  {
    title: "Dependent queries",
    hook: "enabled",
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
    hook: "onMutate / onError rollback",
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
    hook: "queryClient.prefetchQuery",
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Query patterns</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This storefront was built to practise TanStack Query. Each pattern
          below is used somewhere in the real app rather than only in isolation
          — open the devtools panel to watch the cache while you browse.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {patterns.map((pattern) => (
          <Card key={pattern.title} className="flex flex-col">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{pattern.title}</CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">
                  {pattern.hook}
                </Badge>
              </div>
              <CardDescription>{pattern.description}</CardDescription>
            </CardHeader>

            <CardContent className="mt-auto space-y-4">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                <code>{pattern.code}</code>
              </pre>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Used in: {pattern.usedIn}
                </span>
                <Button asChild size="sm" variant="ghost">
                  <Link to={pattern.to}>
                    See it
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
