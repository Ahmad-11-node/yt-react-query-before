import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({ rating = 0, showValue = true, className }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            aria-hidden="true"
            className={cn(
              "size-3.5",
              index < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/40"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground">{rating?.toFixed(1)}</span>
      )}
      <span className="sr-only">{rating?.toFixed(1)} out of 5 stars</span>
    </div>
  );
}
