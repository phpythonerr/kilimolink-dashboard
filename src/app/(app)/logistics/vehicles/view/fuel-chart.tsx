"use client";

import * as React from "react";
import { addDays, subDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function calculateChartBounds(data: any[]) {
  const amounts = data.map((item) => item.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);

  // Calculate bounds with 10% padding
  return {
    minBound: minAmount - minAmount * 0.1,
    maxBound: maxAmount + maxAmount * 0.1,
  };
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface ChartData {
  date: string;
  amount: number;
}

export function FuelChart({ chartData }: { chartData: ChartData[] }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { minBound, maxBound } = calculateChartBounds(chartData);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-base">Fuel Chart</CardTitle>
          </div>
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              }
            />
            <YAxis
              domain={[minBound, maxBound]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Ksh.${value.toFixed(2)}`}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                          {format(new Date(data.date), "EEE, MMM dd, yyyy")}
                        </span>
                        <span className="font-bold">
                          Ksh.{formatCurrency(data.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="amount"
              type="monotone"
              fill="var(--chart-6)"
              fillOpacity={0.4}
              stroke="var(--chart-6)"
              baseLine={minBound}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
