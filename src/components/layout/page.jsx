import { cn } from "@/lib/utils";

/**
 * Shared page shell. Every route uses these so container width, gutters and
 * heading scale stay identical across the app instead of being re-invented
 * per page.
 */
export function Page({ className, ...props }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeader({ title, action, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h2 className="text-base font-medium tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
