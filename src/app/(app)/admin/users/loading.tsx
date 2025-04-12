import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-0.5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <div className="border rounded-md p-4">
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
