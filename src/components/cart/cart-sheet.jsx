import { ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
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
          <ShoppingCartIcon />
          {cart.count > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-1 text-[10px] tabular-nums">
              {cart.count}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>
            Cart
            {cart.count > 0 && (
              <span className="ml-2 font-normal text-muted-foreground">
                {cart.count} item{cart.count === 1 ? "" : "s"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Items you add are saved and stay put after a refresh.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <SheetClose asChild>
                <Button asChild size="sm">
                  <Link to="/products">Browse products</Link>
                </Button>
              </SheetClose>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="px-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="border-b py-4 last:border-0">
                    <div className="flex gap-3">
                      <SheetClose asChild>
                        <Link to={`/products/${item.id}`} className="shrink-0">
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="size-14 rounded-md border bg-muted/40 object-cover"
                          />
                        </Link>
                      </SheetClose>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <SheetClose asChild>
                            <Link
                              to={`/products/${item.id}`}
                              className="line-clamp-2 text-sm font-medium hover:underline"
                            >
                              {item.title}
                            </Link>
                          </SheetClose>
                          <span className="shrink-0 text-sm tabular-nums">
                            {formatPrice(discountedPrice(item) * item.quantity)}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center gap-2">
                          <QuantityStepper
                            value={item.quantity}
                            max={item.stock}
                            label={item.title}
                            onChange={(next) => cart.setQuantity(item.id, next)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto text-muted-foreground"
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
            </ScrollArea>

            <SheetFooter className="border-t">
              {cart.savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discounts</span>
                  <span className="text-success tabular-nums">
                    −{formatPrice(cart.savings)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(cart.total)}</span>
              </div>
              <Separator className="my-1" />
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link to="/cart">View cart</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
