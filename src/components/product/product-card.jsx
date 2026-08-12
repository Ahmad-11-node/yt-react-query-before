import { useQueryClient } from "@tanstack/react-query";
import { HeartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  const outOfStock = product.stock === 0;

  /**
   * Warm the detail query while the pointer is still travelling towards the
   * card, so the detail route usually renders from cache with no spinner.
   */
  const prefetchDetail = () => {
    queryClient.prefetchQuery(productDetailQuery(product.id));
  };

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={prefetchDetail}
      onFocusCapture={prefetchDetail}
    >
      <div className="relative overflow-hidden rounded-md border bg-muted/40">
        {/* No link wrapper here — the title link below is stretched across the
            whole card, so this image is already inside its hit area. */}
        <img
          src={product.thumbnail}
          alt=""
          loading="lazy"
          className={cn(
            "aspect-square w-full object-cover transition-opacity duration-200",
            outOfStock && "opacity-40"
          )}
        />

        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-background/90 py-1.5 text-center text-xs font-medium text-muted-foreground">
            Out of stock
          </span>
        )}

        {/* Always visible rather than revealed on hover — a control the user
            can't see is a control they won't use. */}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isWishlisted}
          // z-10 keeps it above the stretched card link below, which comes
          // later in the DOM and would otherwise swallow the click.
          className="absolute right-1.5 top-1.5 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => {
            const added = wishlist.toggle(product);
            toast(added ? "Saved to wishlist" : "Removed from wishlist");
          }}
        >
          <HeartIcon
            className={cn(
              "text-muted-foreground",
              isWishlisted && "fill-foreground text-foreground"
            )}
          />
        </Button>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-muted-foreground">{titleCase(product.category)}</p>

        <h3 className="mt-1 text-sm font-medium leading-snug">
          <Link to={`/products/${product.id}`} className="hover:underline">
            {/* Stretches the link over the whole card for a larger hit area. */}
            <span className="absolute inset-0" aria-hidden="true" />
            <span className="line-clamp-2">{product.title}</span>
          </Link>
        </h3>

        <RatingStars rating={product.rating} className="mt-1.5" />

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium tabular-nums">
              {formatPrice(discountedPrice(product))}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={outOfStock}
            // Sits above the stretched link so the click reaches the button.
            className="relative z-10"
            onClick={() => {
              cart.addItem(product);
              toast.success("Added to cart", { description: product.title });
            }}
          >
            Add
            <span className="sr-only"> {product.title} to cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
