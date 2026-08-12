import { useCallback, useMemo } from "react";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { discountedPrice } from "@/lib/format";
import { CartContext } from "./cart-context";

export function CartProvider({ children }) {
  const [items, setItems] = usePersistentState("cart", []);

  const addItem = useCallback(
    (product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id);

        if (existing) {
          // Never let the cart exceed what the API says is in stock.
          const capped = Math.min(existing.quantity + quantity, product.stock ?? 99);
          return current.map((item) =>
            item.id === product.id ? { ...item, quantity: capped } : item
          );
        }

        return [
          ...current,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            discountPercentage: product.discountPercentage ?? 0,
            thumbnail: product.thumbnail,
            stock: product.stock ?? 99,
            quantity,
          },
        ];
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (id) => setItems((current) => current.filter((item) => item.id !== id)),
    [setItems]
  );

  const setQuantity = useCallback(
    (id, quantity) => {
      setItems((current) =>
        quantity <= 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              item.id === id
                ? { ...item, quantity: Math.min(quantity, item.stock) }
                : item
            )
      );
    },
    [setItems]
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const listTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + discountedPrice(item) * item.quantity,
      0
    );

    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      count,
      listTotal,
      total,
      savings: listTotal - total,
    };
  }, [items, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
