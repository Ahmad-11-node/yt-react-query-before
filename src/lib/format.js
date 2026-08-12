const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (value) => currency.format(value ?? 0);

/** dummyjson gives a list price plus a discount percentage, not a final price. */
export const discountedPrice = (product) =>
  product.price * (1 - (product.discountPercentage ?? 0) / 100);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const titleCase = (value = "") =>
  value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
