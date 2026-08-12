import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/page";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { discountedPrice, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart-context";

export default function CartPage() {
  const cart = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (cart.items.length === 0) {
    return (
      <Page>
        <PageHeader title="Cart" />
        <Empty className="mt-8 border">
          <EmptyHeader>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Items you add are saved here and stay put after a refresh.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link to="/products">Browse products</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </Page>
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
    <Page>
      <PageHeader
        title="Cart"
        description={`${cart.count} item${cart.count === 1 ? "" : "s"}`}
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                Clear cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all {cart.count} item
                  {cart.count === 1 ? "" : "s"}. You can&apos;t undo it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={cart.clear}>
                  Clear cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_320px]">
        {/* A list with rules between rows, not a card per item. */}
        <ul className="-mt-5">
          {cart.items.map((item) => (
            <li key={item.id} className="border-b last:border-0">
              <div className="flex gap-4 py-5">
                <Link to={`/products/${item.id}`} className="shrink-0">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="size-20 rounded-md border bg-muted/40 object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4">
                    <Link
                      to={`/products/${item.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {formatPrice(discountedPrice(item) * item.quantity)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    {formatPrice(discountedPrice(item))} each
                    {item.discountPercentage > 0 && (
                      <span className="ml-1.5 line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <QuantityStepper
                      value={item.quantity}
                      max={item.stock}
                      onChange={(next) => cart.setQuantity(item.id, next)}
                      label={item.title}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => cart.removeItem(item.id)}
                    >
                      Remove
                      <span className="sr-only"> {item.title}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* One panel, because it is genuinely a distinct sticky region. */}
        <aside className="rounded-lg border p-5 lg:sticky lg:top-20">
          <h2 className="text-sm font-medium">Order summary</h2>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(cart.listTotal)}</dd>
            </div>

            {cart.savings > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discounts</dt>
                <dd className="text-success tabular-nums">
                  −{formatPrice(cart.savings)}
                </dd>
              </div>
            )}

            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Free</dd>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
            </div>
          </dl>

          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={isPlacingOrder}
            onClick={handleCheckout}
          >
            {isPlacingOrder ? "Placing order…" : "Checkout"}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo checkout — nothing is charged.
          </p>
        </aside>
      </div>
    </Page>
  );
}
