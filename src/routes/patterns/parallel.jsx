import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/patterns">
          <ArrowLeftIcon className="size-4" />
          All patterns
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">Parallel queries</h1>
      <p className="mt-2 text-muted-foreground">
        {userIds.length} quer{userIds.length === 1 ? "y" : "ies"} running side by
        side{isFetching ? " · fetching..." : ""}
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          disabled={userIds.length >= 20}
          onClick={() => setUserIds((prev) => [...prev, prev.length + 1])}
        >
          Add a query
        </Button>
        <Button
          variant="outline"
          disabled={userIds.length <= 1}
          onClick={() => setUserIds((prev) => prev.slice(0, -1))}
        >
          Remove one
        </Button>
      </div>

      <ul className="mt-6 grid gap-3">
        {results.map((result, index) => {
          const id = userIds[index];

          return (
            <li key={id}>
              <Card>
                <CardContent className="flex items-center gap-3">
                  {result.isPending ? (
                    <>
                      <Skeleton className="size-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </>
                  ) : result.isError ? (
                    <p className="text-sm text-destructive">{result.error.message}</p>
                  ) : (
                    <>
                      <Avatar>
                        <AvatarImage
                          src={result.data.image}
                          alt={result.data.firstName}
                        />
                        <AvatarFallback>{result.data.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {result.data.firstName} {result.data.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.data.email}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
