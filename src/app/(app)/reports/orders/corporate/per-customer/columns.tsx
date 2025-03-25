"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";

interface UserMetadata {
  business_name?: string;
  // Add other metadata fields if needed
}

interface User {
  id: string;
  user_metadata: UserMetadata;
}

export interface CustomerReport {
  user: User;
  purchases: number;
  sales: number;
  profit: number;
  margin: number;
}

// Define your columns
export const columns: ColumnDef<CustomerReport>[] = [
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
