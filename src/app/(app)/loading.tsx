import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="space-y-2">
        {[...Array(10)].map((item: any, i: number) => (
          <Skeleton className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
