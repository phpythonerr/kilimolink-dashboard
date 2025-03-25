"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export interface OrderData {
  date: string; // The date of the orders
  orders: number; // Number of orders
  total?: number; // Total sales (optional)
  total_buying?: number; // Total buying price (optional)
  other_revenues?: number; // Other revenues (optional)
  expenses?: number; // Expenses (optional)
  profits?: number; // Profit (optional)
}

// Define your columns
export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date");

      return (
        <Link
          href={`/orders/corporate/by-day/view?date=${date}`}
          className="text-primary"
        >
          {new Date(row.getValue("date")).toDateString()}
        </Link>
      );
    },
  },

  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => {
      return `${row.getValue("orders")} orders`;
    },
  },

  // {
  //   accessorKey: "total",
  //   header: "Total Sales",
  //   cell: ({ row }) => {
  //     return `Ksh.${Number(row.getValue("total")).toLocaleString()}`;
  //   },
  // },
  // {
  //   accessorKey: "total_buying",
  //   header: "Total Buying",
  //   cell: ({ row }) => {
  //     const { total_buying_price } = row.original;
  //     return `Ksh.${Number(total_buying_price).toLocaleString()}`;
  //   },
  // },
  // {
  //   accessorKey: "other_revenues",
  //   header: "Other Revenues",
  //   cell: ({ row }) => {
  //     const { revenue } = row.original;
  //     return `Ksh.${Number(revenue).toLocaleString()}`;
  //   },
  // },
  // {
  //   accessorKey: "expenses",
  //   header: "Expenses",
  //   cell: ({ row }) => {
  //     const { expenses } = row.original;
  //     return `Ksh.${Number(expenses).toLocaleString()}`;
  //   },
  // },
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
