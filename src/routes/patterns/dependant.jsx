import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPostById = async (postId) => {
  const response = await fetch(`https://dummyjson.com/posts/${postId}`);
  if (!response.ok) throw new Error("Failed to load the post");
  return response.json();
};

const fetchCommentsByPostId = async (postId) => {
  const response = await fetch(`https://dummyjson.com/comments/post/${postId}`);
  if (!response.ok) throw new Error("Failed to load the comments");
  const data = await response.json();
  return data.comments;
};

export default function DependantPage() {
  const { data: post, isPending } = useQuery({
    queryKey: ["post", 2],
    queryFn: () => fetchPostById(2),
  });

  const { data: comments, isPending: isCommentsPending } = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => fetchCommentsByPostId(post.id),
    // Without this the query runs on first render, when `post` is still
    // undefined, and throws on post.id before the request is even made.
    enabled: Boolean(post?.id),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/patterns">
          <ArrowLeftIcon className="size-4" />
          All patterns
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Dependent queries</h1>
      <p className="mt-2 text-muted-foreground">
        The comments query stays idle until the post supplies its id.
      </p>

      <Card className="mt-6">
        <CardContent className="space-y-2">
          <Badge variant="secondary">Query 1 — post</Badge>
          {isPending ? (
            <Skeleton className="h-6 w-3/4" />
          ) : (
            <p className="text-lg font-medium">{post?.title}</p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="space-y-3">
          <Badge variant="secondary">Query 2 — comments (gated)</Badge>

          {isCommentsPending ? (
            <p className="text-sm text-muted-foreground">
              Waiting for the post to resolve...
            </p>
          ) : (
            <ul className="space-y-2">
              {comments?.map((comment) => (
                <li key={comment.id} className="rounded-md border p-3 text-sm">
                  <span className="font-medium">{comment.user.username}</span>
                  <p className="mt-1 text-muted-foreground">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
