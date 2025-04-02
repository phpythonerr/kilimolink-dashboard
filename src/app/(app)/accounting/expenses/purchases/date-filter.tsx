"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([name, value]) => {
        params.set(name, value);
      });
      return params.toString();
    },
    [searchParams]
  );

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const date: DateRange | undefined = {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };

  return (
    <DatePickerWithRange
      date={date}
      onSelect={(range) => {
        if (!range) return;
        const updates: Record<string, string> = {};
        if (range.from) {
          updates.from = format(range.from, "yyyy-MM-dd");
        }
        if (range.to) {
          updates.to = format(range.to, "yyyy-MM-dd");
        }
        router.push(pathname + "?" + createQueryString(updates));
      }}
    />
  );
}
