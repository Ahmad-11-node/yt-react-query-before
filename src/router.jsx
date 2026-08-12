import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "@/components/layout/root-layout";

// Split per route so the first paint only ships the page being visited.
// RootLayout renders these inside a Suspense boundary.
const HomePage = lazy(() => import("@/routes/home"));
const ProductsPage = lazy(() => import("@/routes/products"));
const ProductDetailPage = lazy(() => import("@/routes/product-detail"));
const CartPage = lazy(() => import("@/routes/cart"));
const WishlistPage = lazy(() => import("@/routes/wishlist"));
const LoginPage = lazy(() => import("@/routes/login"));
const InfinitePage = lazy(() => import("@/routes/infinite"));
const NotFoundPage = lazy(() => import("@/routes/not-found"));
const PatternsPage = lazy(() => import("@/routes/patterns/index"));
const ParallelPage = lazy(() => import("@/routes/patterns/parallel"));
const DependantPage = lazy(() => import("@/routes/patterns/dependant"));
const OptimisticPage = lazy(() => import("@/routes/patterns/optimistic"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:productId", element: <ProductDetailPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/infinite", element: <InfinitePage /> },
      { path: "/patterns", element: <PatternsPage /> },
      { path: "/patterns/parallel", element: <ParallelPage /> },
      { path: "/patterns/dependant", element: <DependantPage /> },
      { path: "/patterns/optimistic", element: <OptimisticPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
