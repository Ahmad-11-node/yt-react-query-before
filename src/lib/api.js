const BASE_URL = "https://dummyjson.com";

/**
 * Thin fetch wrapper that turns non-2xx responses into thrown Errors so React
 * Query can move the observer into its `error` state. Fetch only rejects on
 * network failure, so without this a 404 would resolve as "success".
 */
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with ${response.status}`);
  }

  return response.json();
}

// Trimming the payload keeps list responses small; the detail route asks for
// the full record separately.
const LIST_FIELDS =
  "id,title,price,thumbnail,category,rating,stock,discountPercentage,brand";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Top rated" },
  { value: "title-asc", label: "Name: A to Z" },
];

function sortParams(sort) {
  if (!sort || sort === "featured") return "";
  const [sortBy, order] = sort.split("-");
  return `&sortBy=${sortBy}&order=${order}`;
}

/**
 * dummyjson exposes search and category as separate endpoints rather than as
 * filters on /products, so exactly one of them wins per request.
 */
export function productListPath({ search, category, sort, page = 1, limit = 12 }) {
  const skip = (page - 1) * limit;
  const base = `limit=${limit}&skip=${skip}&select=${LIST_FIELDS}${sortParams(sort)}`;

  if (search) {
    return `/products/search?q=${encodeURIComponent(search)}&${base}`;
  }
  if (category) {
    return `/products/category/${encodeURIComponent(category)}?${base}`;
  }
  return `/products?${base}`;
}

export const api = {
  getProducts: (filters) => request(productListPath(filters)),
  getProduct: (id) => request(`/products/${id}`),
  getCategories: () => request("/products/categories"),

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...credentials, expiresInMins: 60 }),
    }),

  // dummyjson accepts the write and echoes a result back, but nothing is
  // persisted server-side — the optimistic cache update is what the UI shows.
  addReview: ({ productId, review }) =>
    request(`/products/${productId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reviews: [review] }),
    }),
};
