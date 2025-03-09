import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RowOverlayProps {
  show: boolean;
}

export function RowOverlay({ show }: RowOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/50 flex items-center justify-center",
        "backdrop-blur-[1px] z-50"
      )}
    >
      <div className="flex justify-center items-center flex-col gap-1">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <p>Loading</p>
      </div>
    </div>
  );
}
