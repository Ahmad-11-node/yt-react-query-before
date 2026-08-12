import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router-dom";

import "./index.css";

import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/queryClient";
import { router } from "@/router";
import { AuthProvider } from "@/store/auth-provider";
import { CartProvider } from "@/store/cart-provider";
import { WishlistProvider } from "@/store/wishlist-provider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RouterProvider router={router} />
              <Toaster richColors position="bottom-right" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
