import { useQueryClient } from "@tanstack/react-query";
import { HeartIcon, ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/product/rating-stars";
import { discountedPrice, formatPrice, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productDetailQuery } from "@/queries/products";
import { useCart } from "@/store/cart-context";
import { useWishlist } from "@/store/wishlist-context";

export function ProductCard({ product }) {
  const queryClient = useQueryClient();
  const cart = useCart();
  const wishlist = useWishlist();

  const isWishlisted = wishlist.has(product.id);
  const hasDiscount = product.discountPercentage > 0;
  const finalPrice = discountedPrice(product);
  const outOfStock = product.stock === 0;

  /**
   * Warm the detail query while the pointer is still travelling towards the
   * card, so the detail route usually renders from cache with no spinner.
   */
  const prefetchDetail = () => {
    queryClient.prefetchQuery(productDetailQuery(product.id));
  };

  return (
    <Card
      className="group overflow-hidden py-0 transition-shadow hover:shadow-lg"
      onMouseEnter={prefetchDetail}
      onFocusCapture={prefetchDetail}
    >
      <div className="relative overflow-hidden bg-muted">
        <Link to={`/products/${product.id}`} aria-label={product.title}>
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-primary">
            -{Math.round(product.discountPercentage)}%
          </Badge>
        )}

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Badge variant="secondary">Out of stock</Badge>
          </div>
        )}

        <Button
          size="icon"
          variant="secondary"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          onClick={() => {
            const added = wishlist.toggle(product);
            toast(added ? "Saved to wishlist" : "Removed from wishlist");
          }}
        >
          <HeartIcon
            className={cn("size-4", isWishlisted && "fill-destructive text-destructive")}
          />
        </Button>
      </div>

      <CardContent className="space-y-2 p-4">
        <p className="text-xs text-muted-foreground">{titleCase(product.category)}</p>

        <Link
          to={`/products/${product.id}`}
          className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
        >
          {product.title}
        </Link>

        <RatingStars rating={product.rating} />

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="font-semibold">{formatPrice(finalPrice)}</p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>

          <Button
            size="icon"
            className="size-8 shrink-0"
            disabled={outOfStock}
            aria-label={`Add ${product.title} to cart`}
            onClick={() => {
              cart.addItem(product);
              toast.success("Added to cart", { description: product.title });
            }}
          >
            <ShoppingCartIcon className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
