"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export interface OrderData {
  summary_date: string; // The date of the orders
  orders_count: number; // Number of orders
  total_amount?: number; // Total sales (optional)
  total_selling_price?: number; // Total buying price (optional)
  total_buying_price?: number; // Other revenues (optional)
  total_revenue?: number; // Expenses (optional)
  total_expenses?: number; // Expenses (optional)
  profits?: number; // Profit (optional)
}

// Define your columns
export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "summary_date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("summary_date");

      return (
        <Link
          href={`/orders/corporate/by-day/view?date=${date}`}
          className="text-primary"
        >
          {new Date(date).toDateString()}
        </Link>
      );
    },
  },

  {
    accessorKey: "orders_count",
    header: "Orders",
    cell: ({ row }) => {
      return `${row.getValue("orders_count")} orders`;
    },
  },

  {
    accessorKey: "total_amount",
    header: "Total Sales",
    cell: ({ row }) => {
      return `Ksh.${Number(row.getValue("total_amount")).toLocaleString()}`;
    },
  },
  {
    accessorKey: "total_buying",
    header: "Total Buying",
    cell: ({ row }) => {
      const { total_buying_price } = row.original;
      return `Ksh.${Number(total_buying_price).toLocaleString()}`;
    },
  },
  {
    accessorKey: "total_revenue",
    header: "Other Revenues",
    cell: ({ row }) => {
      const { total_revenue } = row.original;
      return `Ksh.${Number(total_revenue).toLocaleString()}`;
    },
  },
  {
    accessorKey: "total_expenses",
    header: "Expenses",
    cell: ({ row }) => {
      const { total_expenses } = row.original;
      return `Ksh.${Number(total_expenses).toLocaleString()}`;
    },
  },
  // {
  //   accessorKey: "profits",
  //   header: "Profit",
  //   cell: ({ row }) => {
  //     const { total_selling_price, total_buying_price, revenue, expenses } =
  //       row.original;
  //     const profit =
  //       total_selling_price + revenue - (total_buying_price + expenses);
  //     return `Ksh.${Number(profit).toLocaleString()}`;
  //   },
  // },
];
