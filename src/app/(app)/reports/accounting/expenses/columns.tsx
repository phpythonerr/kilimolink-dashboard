"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";

// Define your data type
export interface ExpenseInterface {
  id: string;
  date: string;
  amount: number;
  total: number;
  last_month: number;
  this_month: number;
  name: string;
  expense_type_id: {
    id: string;
    name: string;
  };
}

// Define your columns
export const columns: ColumnDef<ExpenseInterface>[] = [
  {
    accessorKey: "expense_type_id",
    header: "Item",
    cell: ({ row }) => {
      const { expense_type_id, name } = row.original;
      return (
        <Link
          className="text-primary"
          href={`/reports/accounting/expenses/view?id=${expense_type_id}`}
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: "last_month",
    header: "Last Month",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("last_month")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "this_month",
    header: "This Month",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("this_month")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      return Number(Number(row.original.total).toFixed(2)).toLocaleString();
    },
  },
];
