import { CompassIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-32 text-center">
      <CompassIcon className="size-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">
        That route doesn&apos;t exist. Let&apos;s get you back to the shop.
      </p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  );
}
