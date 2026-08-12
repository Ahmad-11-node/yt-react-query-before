import { QueryClient } from "@tanstack/react-query";

/**
 * Kept out of main.jsx so modules can import the client without pulling in the
 * file that calls createRoot().
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The catalogue barely changes, so treat data as fresh for a minute
      // instead of refetching on every mount and window focus.
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
