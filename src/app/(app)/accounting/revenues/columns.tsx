"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toDateString();
    },
  },
  {
    accessorKey: "id",
    header: "Expense Type",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const revenue_type = row.original?.revenue_type_id?.name as string;
      return revenue_type;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `Ksh.${Number(row.getValue("amount")).toLocaleString()}`;
    },
  },
];
