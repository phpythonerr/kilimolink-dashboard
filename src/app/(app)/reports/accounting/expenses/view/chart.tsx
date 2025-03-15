"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
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
  price: {
    label: "Price",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function calculatePriceChange(data: any[]) {
  // Get current date and period bounds
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);
  const sixtyDaysAgo = new Date(currentDate);
  sixtyDaysAgo.setDate(currentDate.getDate() - 60);

  // Filter data for current 30-day period and previous 30-day period
  const currentPeriodData = data.filter((item: any) => {
    const itemDate = new Date(item.date);
    return itemDate >= thirtyDaysAgo && itemDate <= currentDate;
  });

  const previousPeriodData = data.filter((item: any) => {
    const itemDate = new Date(item.date);
    return itemDate >= sixtyDaysAgo && itemDate < thirtyDaysAgo;
  });

  // Calculate totals for each period
  const currentTotal = currentPeriodData.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const previousTotal = previousPeriodData.reduce(
    (sum, item) => sum + item.price,
    0
  );

  // Calculate percentage change
  const percentageChange =
    previousTotal === 0
      ? null
      : ((currentTotal - previousTotal) / previousTotal) * 100;

  // Format the result
  return {
    currentTotal,
    previousTotal,
    percentageChange,
    message: formatChangeMessage(percentageChange),
    trend: getTrendIndicator(percentageChange),
  };
}

function formatChangeMessage(percentageChange: number | null): string {
  if (percentageChange === null) return "No data for comparison period";
  if (percentageChange === 0) return "the same as previous period";
  return `${Math.abs(percentageChange).toFixed(1)}% ${
    percentageChange > 0 ? "higher" : "lower"
  } than previous 30-day period`;
}

function getTrendIndicator(percentageChange: number | null) {
  if (percentageChange === null || percentageChange === 0) return null;
  return {
    icon: percentageChange > 0 ? TrendingUp : TrendingDown,
    color: percentageChange > 0 ? "text-red-800" : "text-green-800",
  };
}

function calculateChartBounds(data: any[]) {
  const prices = data.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calculate bounds with 10% padding
  return {
    minBound: minPrice - minPrice * 0.1,
    maxBound: maxPrice + maxPrice * 0.1,
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
  price: number;
}

export function Chart({
  chartData,
  expenseName,
}: {
  chartData: ChartData[];
  expenseName: string;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  const priceChange = calculatePriceChange(chartData);

  const { minBound, maxBound } = calculateChartBounds(chartData);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-base">{`${expenseName} Expense History`}</CardTitle>
            <CardDescription>
              <div className="flex w-full items-start gap-4">
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Current Period:</span>
                    <span>Ksh.{formatCurrency(priceChange.currentTotal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Previous Period:
                    </span>
                    <span>Ksh.{formatCurrency(priceChange.previousTotal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{priceChange.message}</span>
                    {priceChange.trend && (
                      <priceChange.trend.icon
                        className={cn("h-4 w-4", priceChange.trend.color)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardDescription>
          </div>
          {/* <div className={cn("grid gap-2")}>
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
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[70vh]">
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
                          Ksh.{formatCurrency(data.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="price"
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
