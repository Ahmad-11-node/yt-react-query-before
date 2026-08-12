import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const API = "http://localhost:3000/posts";
const postsKey = ["local-posts"];

export default function OptimisticPage() {
  const queryClient = useQueryClient();

  const { data: posts, isPending, error } = useQuery({
    queryKey: postsKey,
    queryFn: async () => {
      const response = await fetch(`${API}?_sort=id&_order=desc`);
      if (!response.ok) throw new Error("Failed to load posts");
      return response.json();
    },
    retry: false,
  });

  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: async (newPost) => {
      const response = await fetch(API, {
        method: "POST",
        body: JSON.stringify(newPost),
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },

    // 1. Paint the new post into the cache before the request finishes.
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: postsKey });
      const previousPosts = queryClient.getQueryData(postsKey);
      queryClient.setQueryData(postsKey, (old = []) => [newPost, ...old]);
      return { previousPosts };
    },

    // 2. Put the snapshot back if the server rejects it.
    onError: (mutationError, _newPost, context) => {
      queryClient.setQueryData(postsKey, context?.previousPosts);
      toast.error("Could not create post", { description: mutationError.message });
    },

    // 3. Either way, resync with the server.
    onSettled: () => queryClient.invalidateQueries({ queryKey: postsKey }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = event.target.elements.title.value.trim();
    if (!title) return;

    mutate({ id: Date.now(), title });
    event.target.reset();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/patterns">
          <ArrowLeftIcon className="size-4" />
          All patterns
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Optimistic updates</h1>
      <p className="mt-2 text-muted-foreground">
        Backed by a local json-server so the writes actually persist — the new
        post appears instantly and rolls back if the request fails.
      </p>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>API not reachable</AlertTitle>
          <AlertDescription>
            Start it in a second terminal with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">npm run server</code>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6">
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input name="title" placeholder="New post title" />
            <Button type="submit" disabled={isCreating}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-2">
        {isPending && !error ? (
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))
        ) : (
          posts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-3">{post.title}</CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
