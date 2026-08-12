import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Single stepper so the cart, the cart sheet and product detail all match. */
export function QuantityStepper({ value, max = 99, onChange, label = "", className }) {
  return (
    <div className={cn("flex h-8 items-center rounded-md border", className)}>
      <Button
        size="icon-sm"
        variant="ghost"
        className="rounded-r-none"
        aria-label={`Decrease quantity${label ? ` of ${label}` : ""}`}
        onClick={() => onChange(value - 1)}
      >
        <MinusIcon />
      </Button>

      <span aria-live="polite" className="w-9 text-center text-sm tabular-nums">
        {value}
      </span>

      <Button
        size="icon-sm"
        variant="ghost"
        className="rounded-l-none"
        disabled={value >= max}
        aria-label={`Increase quantity${label ? ` of ${label}` : ""}`}
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
