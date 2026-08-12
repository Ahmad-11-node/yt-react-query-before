import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors a page header + grid so route swaps don't collapse the layout. */
function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="mt-3 h-3.5 w-3/4" />
            <Skeleton className="mt-2 h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Route components are lazily imported in router.jsx. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="mt-16 border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>A React Query playground built on the dummyjson API.</p>
          <a
            href="https://dummyjson.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            dummyjson.com
          </a>
        </div>
      </footer>
    </div>
  );
}
