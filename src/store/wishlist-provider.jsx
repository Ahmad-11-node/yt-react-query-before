import { useCallback, useMemo } from "react";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { WishlistContext } from "./wishlist-context";

export function WishlistProvider({ children }) {
  const [items, setItems] = usePersistentState("wishlist", []);

  const toggle = useCallback(
    (product) => {
      let added = false;

      setItems((current) => {
        if (current.some((item) => item.id === product.id)) {
          return current.filter((item) => item.id !== product.id);
        }
        added = true;
        return [
          ...current,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            discountPercentage: product.discountPercentage ?? 0,
            thumbnail: product.thumbnail,
            category: product.category,
            rating: product.rating,
            stock: product.stock,
          },
        ];
      });

      return added;
    },
    [setItems]
  );

  const remove = useCallback(
    (id) => setItems((current) => current.filter((item) => item.id !== id)),
    [setItems]
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(
    () => ({
      items,
      toggle,
      remove,
      clear,
      has: (id) => items.some((item) => item.id === id),
      count: items.length,
    }),
    [items, toggle, remove, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
