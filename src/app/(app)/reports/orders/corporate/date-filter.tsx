"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Label } from "@/components/ui/label";

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // Initialize date state from URL params or undefined
  const initialDateRange: DateRange | undefined = React.useMemo(() => {
    try {
      // Add console log for initial params
      console.log("Initial params:", { startDateParam, endDateParam });
      return startDateParam && endDateParam
        ? { from: parseISO(startDateParam), to: parseISO(endDateParam) }
        : undefined;
    } catch (error) {
      console.error("Error parsing date params:", error);
      return undefined; // Fallback to undefined if parsing fails
    }
  }, [startDateParam, endDateParam]);

  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange
  );

  // Effect to update state if URL params change externally
  React.useEffect(() => {
    console.log("URL params changed, updating date state:", initialDateRange); // Add log
    setDate(initialDateRange);
  }, [initialDateRange]);

  const handleDateChange = React.useCallback(
    (newDate: DateRange | undefined) => {
      console.log("handleDateChange called with:", newDate); // Add log
      setDate(newDate); // Update local state to reflect selection immediately

      const current = new URLSearchParams(Array.from(searchParams.entries()));
      console.log("Current search params before update:", current.toString()); // Add log

      if (newDate?.from) {
        const formattedStartDate = format(newDate.from, "yyyy-MM-dd");
        current.set("startDate", formattedStartDate);
        console.log("Setting startDate:", formattedStartDate); // Add log
      } else {
        current.delete("startDate");
        console.log("Deleting startDate"); // Add log
      }

      if (newDate?.to) {
        const formattedEndDate = format(newDate.to, "yyyy-MM-dd");
        current.set("endDate", formattedEndDate);
        console.log("Setting endDate:", formattedEndDate); // Add log
      } else {
        current.delete("endDate");
        console.log("Deleting endDate"); // Add log
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      const newUrl = `${pathname}${query}`;

      console.log("Pushing new URL:", newUrl); // Add log
      router.push(newUrl, { scroll: false }); // Use scroll: false to prevent scrolling to top
    },
    [pathname, router, searchParams]
  ); // Dependencies for useCallback

  return (
    <div className="flex flex-col gap-2">
      <Label>Filter by Date Range</Label>
      {/* Pass the state derived from URL params */}
      <DatePickerWithRange date={date} onDateChange={handleDateChange} />
    </div>
  );
}
