"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";

// Define your data type
export interface RevenuesInterface {
  id: string;
  date: any;
  amount: number;
  revenue_type_id: {
    name: string;
  };
}

// Define your columns
export const columns: ColumnDef<RevenuesInterface>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const { id, user_metadata } = row.original.user;
      return (
        <Link
          href={`/users/customers/corporate/view?id=${id}`}
          className="text-primary"
        >
          {user_metadata?.business_name}
        </Link>
      );
    },
  },
  {
    accessorKey: "purchases",
    header: "Purchases",
    cell: ({ row }) => {
      const purchases = row.original.purchases;
      return Number(Number(purchases).toFixed(2)).toLocaleString();
    },
  },
  {
    accessorKey: "sales",
    header: "Sales",
    cell: ({ row }) => {
      const sales = row.original.sales;
      return Number(Number(sales).toFixed(2)).toLocaleString();
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      const profit = row.original.profit;
      return Number(Number(profit).toFixed(2)).toLocaleString();
    },
  },
  {
    accessorKey: "margin",
    header: "Margin",
    cell: ({ row }) => {
      const margin = row.original.margin;
      return `${Number(Number(margin).toFixed(2)).toLocaleString()}%`;
    },
  },
];
