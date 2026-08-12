# Cachely

**Cached, prefetched, never stale.**

A storefront built on the [dummyjson](https://dummyjson.com) products API to
practise **TanStack Query v5** in a real application rather than in isolated
demos. Every caching pattern in here is used by a page a user actually visits.

React 19 · Vite · TanStack Query v5 · React Router 6 · Tailwind CSS v4 · shadcn/ui

---

## Running it

```bash
npm install
npm run dev
```

The optimistic-updates pattern page also needs a local API on port 3000:

```bash
npm run server     # json-server --watch db.json
```

---

## What's in it

| Route | What it demonstrates |
| --- | --- |
| `/` | Hero, category tiles, top-rated rail, and four category rails fetched in parallel |
| `/products` | Search, category filter, sort and pagination — all driven from the URL |
| `/products/:id` | Gallery, specs, reviews, dependent "related items" query, optimistic review posting |
| `/infinite` | `useInfiniteQuery` with an IntersectionObserver sentinel |
| `/cart` | Quantity controls, discount maths, persisted cart |
| `/wishlist` | Saved items, persisted |
| `/login` | dummyjson auth, mutation loading and error states |
| `/patterns` | Each query pattern with its snippet and a link to where it's used |

Plus dark mode, skeleton loading states, toasts, and route-level code splitting.

---

## Query patterns

**Paginated lists** — `placeholderData: keepPreviousData` keeps the current page
on screen while the next loads, so the grid dims instead of collapsing into
skeletons. The component reads `isPlaceholderData` to apply that dimming.

**Infinite scroll** — `useInfiniteQuery` with `getNextPageParam` derived from the
running total, and a sentinel that requests the next page 300px before it comes
into view. The fetch is guarded on `!isFetchingNextPage` so the observer can't
fire duplicate requests.

**Parallel queries** — `useQueries` runs one request per featured category. The
list length isn't known when the component is written, which rules out calling
`useQuery` in a loop.

**Dependent queries** — related products are gated behind
`enabled: Boolean(product?.category)`. Without the gate the query fires on first
render and throws on an undefined id.

**Optimistic updates** — `onMutate` cancels in-flight refetches, snapshots the
cache, and writes the pending value; `onError` restores the snapshot. The review
mutation deliberately skips `invalidateQueries` because dummyjson accepts the
write without persisting it, so a refetch would silently discard the new review.
The json-server-backed page under `/patterns/optimistic` does invalidate, since
those writes are real.

**Prefetching** — product cards call `queryClient.prefetchQuery` on hover and
focus, so opening a product usually renders straight from cache.

**Key factory** — every key descends from `productKeys.all`, so one
`invalidateQueries` reaches every product query regardless of the filters baked
into its key. Queries are defined once with `queryOptions` and shared between the
components that render them and the prefetch calls that warm them.

---

## Structure

```
src/
  queries/products.js     query keys + queryOptions definitions
  lib/api.js              fetch wrapper that throws on non-2xx
  store/                  cart, wishlist and auth contexts
  hooks/                  debounce, localStorage-backed state
  components/ui/          shadcn/ui (generated)
  components/             product cards, layout, cart sheet
  routes/                 one file per page
```

**Why the cart isn't in React Query.** React Query caches *server* state. The
cart and wishlist are client state — nothing on the server owns them — so they
live in Context backed by localStorage and survive a refresh. Mixing them into
the query cache would mean inventing fake query keys for data no server returns.

**Filters live in the URL.** Search, category, sort and page are all read from
`useSearchParams`, so any result set is shareable and the back button steps
through filter changes. The search box debounces into the URL rather than
querying off every keystroke.

---

## Assets

Banner photography in `public/banners/` comes from
[Unsplash](https://unsplash.com) under the Unsplash License (free for
commercial and non-commercial use, no attribution required). The files are
committed rather than hot-linked so the app doesn't depend on a third-party CDN
at runtime — 560 KB total, cropped to 1600×640.

Product imagery is served by dummyjson.

## Notes on the API

dummyjson exposes search and category as separate endpoints instead of filters
on `/products`, so the two are mutually exclusive — picking a category clears the
search and vice versa. Writes (`PUT`/`PATCH`/`POST` on products) are accepted and
echoed back but never persisted, which is why the review flow relies on the
optimistic cache write rather than a refetch.
