import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/navbar";

function RouteFallback() {
  return (
    <div className="grid place-items-center py-32">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Route components are lazily imported in main.jsx. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground">
          <p>
            Nova Store — a React Query playground built on the{" "}
            <a
              href="https://dummyjson.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              dummyjson
            </a>{" "}
            API.
          </p>
        </div>
      </footer>
    </div>
  );
}
