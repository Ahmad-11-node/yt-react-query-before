import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    <Page className="max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2.5 mb-5">
        <Link to="/patterns">
          <ArrowLeftIcon />
          All patterns
        </Link>
      </Button>

      <PageHeader
        title="Optimistic updates"
        description="Backed by a local json-server, so these writes actually persist. The new post appears instantly and rolls back if the request fails."
      />

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>API not reachable</AlertTitle>
          <AlertDescription>
            Start it in a second terminal with{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              npm run server
            </code>
          </AlertDescription>
        </Alert>
      )}

      <Separator className="mt-6" />

      <form onSubmit={handleSubmit} className="mt-8 flex gap-2">
        <Input
          name="title"
          placeholder="New post title"
          aria-label="New post title"
          className="max-w-sm"
        />
        <Button type="submit" disabled={isCreating}>
          Add post
        </Button>
      </form>

      <ul className="mt-8">
        {isPending && !error
          ? Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="border-b py-3 last:border-0">
                <Skeleton className="h-4 w-56" />
              </li>
            ))
          : posts?.map((post) => (
              <li key={post.id} className="border-b py-3 text-sm last:border-0">
                {post.title}
              </li>
            ))}
      </ul>
    </Page>
  );
}
