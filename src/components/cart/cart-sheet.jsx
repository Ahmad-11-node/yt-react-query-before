import { MinusIcon, PlusIcon, ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { discountedPrice, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart-context";

export function CartSheet() {
  const cart = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
          <ShoppingCartIcon className="size-5" />
          {cart.count > 0 && (
            <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
              {cart.count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {cart.count === 0
              ? "Your cart is empty."
              : `${cart.count} item${cart.count === 1 ? "" : "s"} ready to check out.`}
          </SheetDescription>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <ShoppingCartIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nothing here yet — go find something good.
            </p>
            <Button asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <ul className="space-y-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="size-16 shrink-0 rounded-md border object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.id}`}
                        className="line-clamp-2 text-sm font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(discountedPrice(item))}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          aria-label="Decrease quantity"
                          onClick={() => cart.setQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-7"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                          onClick={() => cart.setQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-auto size-7 text-muted-foreground"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => cart.removeItem(item.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <SheetFooter className="gap-3">
              <Separator />
              {cart.savings > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount savings</span>
                  <span>-{formatPrice(cart.savings)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <Button asChild className="w-full">
                <Link to="/cart">View cart & checkout</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
