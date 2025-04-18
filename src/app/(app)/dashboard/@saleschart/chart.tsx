"use client";

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

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useState } from "react";

interface RawChartData {
  delivery_date: string;
  total_buying_price: number;
  total_selling_price: number;
}

interface SalesChartProps {
  data: RawChartData[];
}

type SeriesKey = "purchases" | "sales" | "profits";

const formatYAxisValue = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const formatXAxisDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function SalesChart({ data }: SalesChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<SeriesKey>>(new Set());

  const toggleSeries = (dataKey: SeriesKey) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(dataKey)) {
      newHidden.delete(dataKey);
    } else {
      newHidden.add(dataKey);
    }
    setHiddenSeries(newHidden);
  };

  // Transform data to include calculated profits
  const chartData = data
    .map((item) => ({
      delivery_date: item.delivery_date,
      purchases: item.total_buying_price,
      sales: item.total_selling_price,
      profits: item.total_selling_price - item.total_buying_price,
    }))
    .sort(
      (a, b) =>
        new Date(a.delivery_date).getTime() -
        new Date(b.delivery_date).getTime()
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Summary</CardTitle>
          <div></div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
            barGap={0} // Remove gap between bars in same category
            barCategoryGap={30} // Add space between different dates
          >
            <XAxis
              dataKey="delivery_date"
              tickFormatter={formatXAxisDate}
              stroke="#888888"
              fontSize={12}
            />
            <YAxis
              stroke="#888888"
              fontSize={10}
              tickFormatter={(value) => formatYAxisValue(value)}
              width={20}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {new Date(label).toLocaleDateString()}
                          </span>
                          {payload.map((item) => (
                            <div
                              key={item.dataKey}
                              className="flex gap-2 text-sm items-center"
                            >
                              <div
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    item.dataKey === "sales"
                                      ? "#2e7d32"
                                      : item.dataKey === "purchases"
                                      ? "#81c784"
                                      : "#2196f3",
                                }}
                              />
                              <span className="capitalize">
                                {item.dataKey}:
                              </span>
                              <span className="font-bold">
                                Ksh{Number(item.value).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              onClick={(e) => toggleSeries(e.dataKey as SeriesKey)}
              wrapperStyle={{ cursor: "pointer" }}
            />
            <Bar
              dataKey="purchases"
              fill="#81c784"
              name="Purchases"
              hide={hiddenSeries.has("purchases")}
            />
            <Bar
              dataKey="sales"
              fill="#2e7d32"
              name="Sales"
              hide={hiddenSeries.has("sales")}
            />
            <Bar
              dataKey="profits"
              fill="#2196f3"
              name="Profits"
              hide={hiddenSeries.has("profits")}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
