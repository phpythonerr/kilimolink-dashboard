"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define your data type
export interface User {
  order_number: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  created_at: string;
}

// Define your columns
export const columns: ColumnDef<User>[] = [
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

  {
    accessorKey: "total",
    header: "Total Sales",
    cell: ({ row }) => {
      return `Ksh.${Number(row.getValue("total")).toLocaleString()}`;
    },
  },
];
