import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Page, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <Page className="max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2.5 mb-5">
        <Link to="/patterns">
          <ArrowLeftIcon />
          All patterns
        </Link>
      </Button>

      <PageHeader
        title="Dependent queries"
        description="The comments query stays idle until the post supplies its id."
      />

      <Separator className="mt-6" />

      <section className="mt-8">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-base font-medium tracking-tight">Post</h2>
          <code className="font-mono text-xs text-muted-foreground">
            [&quot;post&quot;, 2]
          </code>
        </div>
        {isPending ? (
          <Skeleton className="mt-3 h-5 w-2/3" />
        ) : (
          <p className="mt-3 text-sm">{post?.title}</p>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-base font-medium tracking-tight">Comments</h2>
          <code className="font-mono text-xs text-muted-foreground">
            [&quot;comments&quot;, {post?.id ?? "undefined"}]
          </code>
        </div>

        {isCommentsPending ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Idle — waiting for the post to resolve.
          </p>
        ) : (
          <ul className="mt-3">
            {comments?.map((comment) => (
              <li key={comment.id} className="border-b py-3 last:border-0">
                <p className="text-sm font-medium">{comment.user.username}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
