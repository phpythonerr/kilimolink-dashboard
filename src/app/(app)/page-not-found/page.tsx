import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          You don't have permission to access this page or it doesn't exist.
        </p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
