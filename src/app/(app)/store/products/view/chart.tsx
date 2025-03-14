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

function calculatePriceChange(data) {
  // Get current date
  const currentDate = new Date();

  // Calculate first day of current month and previous month
  const firstDayThisMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const firstDayLastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  // Calculate last day of previous month (one day before first day of current month)
  const lastDayLastMonth = new Date(firstDayThisMonth);
  lastDayLastMonth.setDate(lastDayLastMonth.getDate() - 1);

  // Filter data for this month and last month
  const thisMonthData = data.filter((item: any) => {
    const itemDate = new Date(item.date);
    return itemDate >= firstDayThisMonth && itemDate <= currentDate;
  });

  const lastMonthData = data.filter((item: any) => {
    const itemDate = new Date(item.date);
    return itemDate >= firstDayLastMonth && itemDate < firstDayThisMonth;
  });

  // Calculate averages
  const thisMonthAvg =
    thisMonthData.reduce((sum, item) => sum + item.price, 0) /
      thisMonthData.length || 0;
  const lastMonthAvg =
    lastMonthData.reduce((sum, item) => sum + item.price, 0) /
      lastMonthData.length || 0;

  // Calculate percentage change
  const percentageChange =
    lastMonthAvg === 0
      ? null
      : ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100;

  // Format the result
  const result = {
    thisMonthAvg,
    lastMonthAvg,
    percentageChange,
    message:
      percentageChange === null
        ? "Cannot calculate percentage change (no data for last month)"
        : percentageChange === 0
        ? "the same as last month."
        : `${Math.abs(percentageChange).toFixed(2)}% ${
            percentageChange >= 0 ? "higher" : "lower"
          } this month compared to last month`,
  };

  return result;
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

export function Chart({ chartData }: any) {
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
          <div>
            <CardTitle className="text-base">Price History</CardTitle>
            <CardDescription>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none">
                    <span>{`Prices are ${priceChange?.message}`}</span>
                    <span>
                      {priceChange?.percentageChange != 0 &&
                        (priceChange?.percentageChange >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-800" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-800" />
                        ))}
                    </span>
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
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="price"
              type="natural"
              fill="var(--chart-6)"
              fillOpacity={0.4}
              stroke="var(--chart-6)"
              baseValue={minBound}
              maxValue={maxBound}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
