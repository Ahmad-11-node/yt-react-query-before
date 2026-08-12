import { HeartIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/store/wishlist-context";

export default function WishlistPage() {
  const wishlist = useWishlist();

  if (wishlist.items.length === 0) {
    return (
      <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-24 text-center">
        <HeartIcon className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">No saved items</h1>
        <p className="text-muted-foreground">
          Tap the heart on any product to keep it here for later.
        </p>
        <Button asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="mt-1 text-muted-foreground">
            {wishlist.count} saved item{wishlist.count === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="outline" onClick={wishlist.clear}>
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
