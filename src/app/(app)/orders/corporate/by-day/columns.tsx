"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export interface OrderData {
  summary_date: string;
  orders_count: number;
  total_amount?: number;
}

export const columns: ColumnDef<OrderData>[] = [
  {
    accessorKey: "summary_date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("summary_date") as string;
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
      const count = row.getValue("orders_count") as number;
      return `${count} orders`;
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Sales",
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number;
      return `Ksh.${amount.toLocaleString()}`;
    },
  },
];
