import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Page, PageHeader } from "@/components/layout/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const fetchUserById = async (userId) => {
  const response = await fetch(`https://dummyjson.com/users/${userId}`);
  if (!response.ok) throw new Error(`Failed to load user ${userId}`);
  return response.json();
};

export default function ParallelPage() {
  const [userIds, setUserIds] = useState([1, 2, 3]);

  // One query per id, all in flight together. useQueries exists for exactly
  // this: a list of queries whose length isn't known when the code is written,
  // which rules out calling useQuery in a loop.
  const results = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => fetchUserById(id),
    })),
  });

  const isFetching = results.some((result) => result.isFetching);

  return (
    <Page className="max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2.5 mb-5">
        <Link to="/patterns">
          <ArrowLeftIcon />
          All patterns
        </Link>
      </Button>

      <PageHeader
        title="Parallel queries"
        description={`${userIds.length} quer${userIds.length === 1 ? "y" : "ies"} running side by side${isFetching ? " · fetching…" : ""}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={userIds.length <= 1}
              onClick={() => setUserIds((prev) => prev.slice(0, -1))}
            >
              Remove
            </Button>
            <Button
              size="sm"
              disabled={userIds.length >= 20}
              onClick={() => setUserIds((prev) => [...prev, prev.length + 1])}
            >
              Add query
            </Button>
          </>
        }
      />

      <Separator className="mt-6" />

      <ul className="mt-2">
        {results.map((result, index) => {
          const id = userIds[index];

          return (
            <li key={id} className="flex items-center gap-3 border-b py-4 last:border-0">
              {result.isPending ? (
                <>
                  <Skeleton className="size-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                </>
              ) : result.isError ? (
                <p className="text-sm text-destructive">{result.error.message}</p>
              ) : (
                <>
                  <Avatar className="size-9">
                    <AvatarImage src={result.data.image} alt="" />
                    <AvatarFallback>{result.data.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {result.data.firstName} {result.data.lastName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {result.data.email}
                    </p>
                  </div>
                  <code className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                    [&quot;user&quot;, {id}]
                  </code>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
