"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export interface OrderData {
  summary_date: string; // The date of the orders
  orders_count: number; // Number of orders
  total_amount?: number; // Total sales (optional)
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
];
