"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface DateFilterProps {
  onChange?: (startDate: Date, endDate: Date) => void;
}

export default function DateFilter({ onChange }: DateFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date>(() => {
    const startParam = searchParams.get("start");
    return startParam ? new Date(startParam) : startOfMonth(new Date());
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    const endParam = searchParams.get("end");
    return endParam ? new Date(endParam) : endOfMonth(new Date());
  });

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  useEffect(() => {
    if (onChange) {
      onChange(startDate, endDate);
    }

    // Update URL with the selected date range
    const params = new URLSearchParams(searchParams);
    params.set("start", startDate.toISOString());
    params.set("end", endDate.toISOString());
    router.push(`?${params.toString()}`);
  }, [startDate, endDate, onChange, router, searchParams]);

  const handleCurrentMonth = () => {
    const now = new Date();
    setStartDate(startOfMonth(now));
    setEndDate(endOfMonth(now));
  };

  const handleLastMonth = () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    setStartDate(startOfMonth(lastMonth));
    setEndDate(endOfMonth(lastMonth));
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  setStartDate(date);
                  setIsStartOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <span>to</span>
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(endDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  setEndDate(date);
                  setIsEndOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCurrentMonth}>
          Current Month
        </Button>
        <Button variant="outline" onClick={handleLastMonth}>
          Last Month
        </Button>
      </div>
    </div>
  );
}
