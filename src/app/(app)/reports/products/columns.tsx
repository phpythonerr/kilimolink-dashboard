"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define your data type
export interface User {
  item: string;
}

// Define your columns
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const id = row.original.id as string;
      return (
        <Link
          href={`/orders/corporate/view?id=${id}`}
          className="text-primary"
        >{`${name}`}</Link>
      );
    },
  },
  {
    accessorKey: "total_quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const qty = row.getValue("total_quantity") as number;
      const unit = row.original.quantity_unit as string;
      return `${Number(qty).toLocaleString()} ${unit}`;
    },
  },
  {
    accessorKey: "avg_buying_price",
    header: "Avg. Buying Price",
    cell: ({ row }) => {
      const bp = row.getValue("avg_buying_price") as number;
      return `Ksh.${Number(bp).toFixed(2).toLocaleString()}`;
    },
  },
  {
    accessorKey: "avg_buying_price_last_month",
    header: "Avg. Buying Price Last Month",
    cell: ({ row }) => {
      const bp = row.getValue("avg_buying_price_last_month") as number;
      return `Ksh.${Number(bp).toFixed(2).toLocaleString()}`;
    },
  },
  {
    accessorKey: "avg_buying_price_this_month",
    header: "Avg. Buying Price This Month",
    cell: ({ row }) => {
      const bp = row.getValue("avg_buying_price_this_month") as number;
      return `Ksh.${Number(bp).toFixed(2).toLocaleString()}`;
    },
  },
];
