import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartIcon, StarIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Page, SectionHeader } from "@/components/layout/page";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { RatingStars } from "@/components/product/rating-stars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
      <Page>
        <Alert variant="destructive">
          <AlertTitle>Product not found</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{error.message}</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/products">Back to shop</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  if (isPending) return <ProductDetailSkeleton />;

  const finalPrice = discountedPrice(product);
  const hasDiscount = product.discountPercentage > 0;
  const isWishlisted = wishlist.has(product.id);
  const images = product.images?.length ? product.images : [product.thumbnail];
  const inStock = product.stock > 0;

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

  const specs = [
    ["SKU", product.sku],
    ["Brand", product.brand],
    ["Category", titleCase(product.category)],
    ["Weight", product.weight != null && `${product.weight} kg`],
    [
      "Dimensions",
      product.dimensions &&
        `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`,
    ],
    ["Minimum order", product.minimumOrderQuantity],
    ["Stock", product.stock],
    ["Tags", product.tags?.join(", ")],
  ];

  return (
    <Page>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/products?category=${product.category}`}>
                {titleCase(product.category)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-lg border bg-muted/40">
            <img
              src={images[activeImage]}
              alt={product.title}
              className="aspect-square w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === activeImage}
                  className={cn(
                    "size-16 overflow-hidden rounded-md border bg-muted/40 transition-colors",
                    "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                    index === activeImage
                      ? "border-foreground"
                      : "hover:border-muted-foreground/40"
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
          <p className="text-sm text-muted-foreground">
            {product.brand ?? titleCase(product.category)}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {product.title}
          </h1>

          <div className="mt-2.5 flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              · {product.reviews?.length ?? 0} reviews
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-2.5">
            <span className="text-2xl font-semibold tabular-nums">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm font-medium text-success">
                  {Math.round(product.discountPercentage)}% off
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <Separator className="my-6" />

          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              max={product.stock}
              onChange={(next) => setQuantity(Math.max(1, next))}
            />

            <Button
              size="lg"
              className="flex-1 sm:flex-none sm:min-w-44"
              disabled={!inStock}
              onClick={() => {
                cart.addItem(product, quantity);
                toast.success(`Added ${quantity} to cart`, {
                  description: product.title,
                });
              }}
            >
              {inStock ? "Add to cart" : "Out of stock"}
            </Button>

            <Button
              size="icon-lg"
              variant="outline"
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={isWishlisted}
              onClick={() => {
                const added = wishlist.toggle(product);
                toast(added ? "Saved to wishlist" : "Removed from wishlist");
              }}
            >
              <HeartIcon className={cn(isWishlisted && "fill-foreground")} />
            </Button>
          </div>

          <p
            className={cn(
              "mt-3 text-sm",
              product.stock > 10 ? "text-muted-foreground" : "text-warning"
            )}
          >
            {product.availabilityStatus ?? (inStock ? "In stock" : "Out of stock")}
            {inStock && product.stock <= 10 && ` — only ${product.stock} left`}
          </p>

          <dl className="mt-6 space-y-2 text-sm">
            {[
              ["Shipping", product.shippingInformation],
              ["Warranty", product.warrantyInformation],
              ["Returns", product.returnPolicy],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      {/* Details */}
      <Tabs defaultValue="specs" className="mt-14">
        <TabsList>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({product.reviews?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="mt-5 max-w-2xl">
          <Table>
            <TableBody>
              {specs
                .filter(([, value]) => value !== null && value !== undefined && value !== false && value !== "")
                .map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell className="w-40 text-muted-foreground">
                      {label}
                    </TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="reviews" className="mt-5 max-w-2xl">
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="review">Write a review</FieldLabel>
              <Textarea
                id="review"
                rows={3}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="What did you think of it?"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex items-center gap-0.5"
                role="radiogroup"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={value === reviewRating}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onClick={() => setReviewRating(value)}
                    className="rounded-sm p-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <StarIcon
                      className={cn(
                        "size-4 transition-colors",
                        value <= reviewRating
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={reviewMutation.isPending || !reviewText.trim()}
              >
                {reviewMutation.isPending ? "Posting…" : "Post review"}
              </Button>
            </div>
          </form>

          <Separator className="my-6" />

          {product.reviews?.length ? (
            <ul className="space-y-5">
              {product.reviews.map((review, index) => (
                <li
                  key={`${review.reviewerEmail}-${index}`}
                  className="border-b pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <RatingStars rating={review.rating} showValue={false} />
                    <span className="text-sm font-medium">{review.reviewerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.date)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to write one.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Related — powered by the dependent query above */}
      <section className="mt-14">
        <SectionHeader title={`More in ${titleCase(product.category)}`} />

        <div className="mt-4">
          {relatedPending ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {related?.products
                ?.filter((item) => item.id !== product.id)
                .slice(0, 4)
                .map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}

function ProductDetailSkeleton() {
  return (
    <Page>
      <Skeleton className="h-4 w-56" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-5 h-8 w-28" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-9 flex gap-3">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-44" />
          </div>
        </div>
      </div>
    </Page>
  );
}
