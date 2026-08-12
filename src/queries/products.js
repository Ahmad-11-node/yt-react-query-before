import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from "@tanstack/react-query";

import { api } from "@/lib/api";

/**
 * Key factory. Every key derives from `all`, so a single
 * invalidateQueries({ queryKey: productKeys.all }) reaches every product query
 * regardless of the filters baked into it.
 */
export const productKeys = {
  all: ["products"],
  lists: () => [...productKeys.all, "list"],
  list: (filters) => [...productKeys.lists(), filters],
  infinite: (filters) => [...productKeys.all, "infinite", filters],
  details: () => [...productKeys.all, "detail"],
  detail: (id) => [...productKeys.details(), String(id)],
  categories: () => ["categories"],
};

export const PAGE_SIZE = 12;

/**
 * Shared definitions rather than inline useQuery calls: the same object is
 * reused by the component that renders the data and by the prefetch call that
 * warms it on hover.
 */
export const productListQuery = (filters) =>
  queryOptions({
    queryKey: productKeys.list(filters),
    queryFn: () => api.getProducts(filters),
    // Holds the previous page on screen while the next one loads, so the grid
    // never collapses back to a skeleton during pagination.
    placeholderData: keepPreviousData,
  });

export const productDetailQuery = (id) =>
  queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: () => api.getProduct(id),
    enabled: Boolean(id),
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: productKeys.categories(),
    queryFn: api.getCategories,
    // The category list is effectively static, so never refetch it.
    staleTime: Infinity,
  });

export const infiniteProductsQuery = (filters) =>
  infiniteQueryOptions({
    queryKey: productKeys.infinite(filters),
    queryFn: ({ pageParam }) =>
      api.getProducts({ ...filters, page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.products.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
