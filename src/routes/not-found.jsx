import { Link } from "react-router-dom";

import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFoundPage() {
  return (
    <Page className="py-24">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/products">Browse products</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </Page>
  );
}
