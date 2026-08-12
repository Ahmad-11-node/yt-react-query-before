import { useState } from "react";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { discountedPrice, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart-context";

export default function CartPage() {
  const cart = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-24 text-center">
        <ShoppingBagIcon className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Once you add something it will show up here — and stick around after a
          refresh.
        </p>
        <Button asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  const handleCheckout = () => {
    setIsPlacingOrder(true);
    // No real checkout behind this demo API — settle, confirm, then reset.
    setTimeout(() => {
      setIsPlacingOrder(false);
      cart.clear();
      toast.success("Order placed", {
        description: "Thanks! This demo doesn't charge anything.",
      });
    }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {cart.items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex gap-4">
                  <Link to={`/products/${item.id}`} className="shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="size-24 rounded-md border object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/products/${item.id}`}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatPrice(discountedPrice(item))} each
                      {item.discountPercentage > 0 && (
                        <span className="ml-2 line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Decrease quantity"
                          onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                          onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-3.5" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => cart.removeItem(item.id)}
                      >
                        <Trash2Icon className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {formatPrice(discountedPrice(item) * item.quantity)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal ({cart.count} items)
              </span>
              <span>{formatPrice(cart.listTotal)}</span>
            </div>

            {cart.savings > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discounts</span>
                <span>-{formatPrice(cart.savings)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Free</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={isPlacingOrder}
              onClick={handleCheckout}
            >
              {isPlacingOrder ? "Placing order..." : "Checkout"}
            </Button>

            <Button variant="ghost" className="w-full" onClick={cart.clear}>
              Clear cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
