import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  HeartIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { RatingStars } from "@/components/product/rating-stars";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { discountedPrice, formatDate, formatPrice, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productDetailQuery, productKeys, productListQuery } from "@/queries/products";
import { useAuth } from "@/store/auth-context";
import { useCart } from "@/store/cart-context";
import { useWishlist } from "@/store/wishlist-context";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const queryClient = useQueryClient();
  const cart = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  const { data: product, isPending, isError, error } = useQuery(
    productDetailQuery(productId)
  );

  // Dependent query: only runs once the product tells us which category to
  // pull related items from.
  const { data: related, isPending: relatedPending } = useQuery({
    ...productListQuery({ category: product?.category, limit: 8, page: 1 }),
    enabled: Boolean(product?.category),
  });

  const reviewMutation = useMutation({
    mutationFn: api.addReview,
    onMutate: async ({ review }) => {
      const key = productKeys.detail(productId);
      // Stop any in-flight refetch from overwriting the optimistic write.
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old) => ({
        ...old,
        reviews: [review, ...(old?.reviews ?? [])],
      }));

      return { previous };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(productKeys.detail(productId), context?.previous);
      toast.error("Could not post review", { description: mutationError.message });
    },
    onSuccess: () => {
      setReviewText("");
      toast.success("Review posted");
    },
    // Deliberately no invalidate here: dummyjson accepts the PATCH but doesn't
    // store it, so refetching would silently drop the review we just added.
  });

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Product not found</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <span>{error.message}</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/products">Back to shop</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isPending) return <ProductDetailSkeleton />;

  const finalPrice = discountedPrice(product);
  const hasDiscount = product.discountPercentage > 0;
  const isWishlisted = wishlist.has(product.id);
  const images = product.images?.length ? product.images : [product.thumbnail];

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    if (!reviewText.trim()) return;

    reviewMutation.mutate({
      productId: product.id,
      review: {
        rating: reviewRating,
        comment: reviewText.trim(),
        date: new Date().toISOString(),
        reviewerName: user ? `${user.firstName} ${user.lastName}` : "Guest shopper",
        reviewerEmail: user?.email ?? "guest@example.com",
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/products">
          <ArrowLeftIcon className="size-4" />
          Back to shop
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border bg-muted">
            <img
              src={images[activeImage]}
              alt={product.title}
              className="aspect-square w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    "size-16 overflow-hidden rounded-md border bg-muted",
                    index === activeImage && "ring-2 ring-primary"
                  )}
                >
                  <img src={image} alt="" className="size-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{titleCase(product.category)}</Badge>
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
            <Badge
              variant={product.stock > 10 ? "outline" : "destructive"}
              className={cn(product.stock > 10 && "text-emerald-600")}
            >
              {product.availabilityStatus ?? `${product.stock} in stock`}
            </Badge>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">{product.title}</h1>

          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              {product.reviews?.length ?? 0} reviews
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge className="bg-primary">
                  Save {Math.round(product.discountPercentage)}%
                </Badge>
              </>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <Separator className="my-6" />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                size="icon"
                variant="ghost"
                className="size-9"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <MinusIcon className="size-4" />
              </Button>
              <span className="w-10 text-center tabular-nums">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="size-9"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
              onClick={() => {
                cart.addItem(product, quantity);
                toast.success(`Added ${quantity} to cart`, {
                  description: product.title,
                });
              }}
            >
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              aria-label="Save to wishlist"
              aria-pressed={isWishlisted}
              onClick={() => {
                const added = wishlist.toggle(product);
                toast(added ? "Saved to wishlist" : "Removed from wishlist");
              }}
            >
              <HeartIcon
                className={cn(
                  "size-4",
                  isWishlisted && "fill-destructive text-destructive"
                )}
              />
            </Button>
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <InfoRow icon={TruckIcon} text={product.shippingInformation} />
            <InfoRow icon={ShieldCheckIcon} text={product.warrantyInformation} />
            <InfoRow icon={RotateCcwIcon} text={product.returnPolicy} />
          </div>
        </div>
      </div>

      {/* Details + reviews */}
      <Tabs defaultValue="specs" className="mt-12">
        <TabsList>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviews?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="mt-4">
          <Card>
            <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Spec label="SKU" value={product.sku} />
              <Spec label="Brand" value={product.brand ?? "—"} />
              <Spec label="Weight" value={`${product.weight} kg`} />
              <Spec
                label="Dimensions"
                value={
                  product.dimensions
                    ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`
                    : "—"
                }
              />
              <Spec label="Minimum order" value={product.minimumOrderQuantity} />
              <Spec label="Stock" value={product.stock} />
              <Spec label="Tags" value={product.tags?.join(", ")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-6">
          <Card>
            <CardContent>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <Label htmlFor="review">Write a review</Label>
                <Input
                  id="review"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="What did you think?"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={value === reviewRating}
                        onClick={() => setReviewRating(value)}
                        className="rounded p-0.5"
                      >
                        <StarIcon
                          className={cn(
                            "size-5 transition-colors",
                            value <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted-foreground/40"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Button type="submit" disabled={reviewMutation.isPending}>
                    {reviewMutation.isPending ? "Posting..." : "Post review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            {product.reviews?.map((review, index) => (
              <AccordionItem key={`${review.reviewerEmail}-${index}`} value={String(index)}>
                <AccordionTrigger>
                  <div className="flex flex-1 items-center gap-3 pr-4">
                    <RatingStars rating={review.rating} showValue={false} />
                    <span className="font-medium">{review.reviewerName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {review.comment}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Related — powered by the dependent query above */}
      <section className="mt-14">
        <h2 className="mb-4 text-xl font-semibold">
          More from {titleCase(product.category)}
        </h2>

        {relatedPending ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related?.products
              ?.filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 text-muted-foreground">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "—"}</span>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </div>
      </div>
      <div className="mt-12 flex items-center gap-2">
        <PackageIcon className="size-4 text-muted-foreground" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}
