import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Monochrome by design: colour in this UI carries meaning (success, warning,
 * destructive), and a rating isn't any of those. Shape and fill carry it here.
 */
export function RatingStars({ rating = 0, showValue = true, className }) {
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex gap-px" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            className={cn(
              "size-3.5",
              index < rounded
                ? "fill-foreground text-foreground"
                : "text-muted-foreground/35"
            )}
          />
        ))}
      </div>

      {showValue && (
        <span className="text-xs text-muted-foreground tabular-nums" aria-hidden="true">
          {rating?.toFixed(1)}
        </span>
      )}

      <span className="sr-only">{rating?.toFixed(1)} out of 5 stars</span>
    </div>
  );
}
