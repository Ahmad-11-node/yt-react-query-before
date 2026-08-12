import { Link } from "react-router-dom";

import { Page, PageHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
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
import { useWishlist } from "@/store/wishlist-context";

export default function WishlistPage() {
  const wishlist = useWishlist();

  if (wishlist.items.length === 0) {
    return (
      <Page>
        <PageHeader title="Wishlist" />
        <Empty className="mt-8 border">
          <EmptyHeader>
            <EmptyTitle>Nothing saved yet</EmptyTitle>
            <EmptyDescription>
              Select the heart on any product to keep it here for later.
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

  return (
    <Page>
      <PageHeader
        title="Wishlist"
        description={`${wishlist.count} saved item${wishlist.count === 1 ? "" : "s"}`}
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your wishlist?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all {wishlist.count} saved item
                  {wishlist.count === 1 ? "" : "s"}. You can&apos;t undo it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={wishlist.clear}>
                  Clear wishlist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <Separator className="mt-6" />

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Page>
  );
}
