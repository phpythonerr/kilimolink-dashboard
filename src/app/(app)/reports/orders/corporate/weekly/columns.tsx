"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";

// Define your data type
export interface WeeklyReport {
  id: string;
  week_start_date: string;
  total_buying_price: number;
  total_selling_price: number;
  total_expenses: number;
  total_commissions: number;
  total_other_revenue: number;
}

// Define your columns
export const columns: ColumnDef<WeeklyReport>[] = [
  {
    accessorKey: "week_start_date",
    header: "Week",
    cell: ({ row }) => {
      const week_start_date = row.getValue("week_start_date") as string;
      if (!week_start_date) return "-";

      const startDate = new Date(week_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      return `${startDate.toDateString()} - ${endDate.toDateString()}`;
    },
  },
  {
    accessorKey: "total_buying_price",
    header: "Purchases",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("total_buying_price")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "total_expenses",
    header: "Expenses",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("total_expenses")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "total_selling_price",
    header: "Sales",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("total_selling_price")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "total_commissions",
    header: "Commissions",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("total_commissions")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "total_other_revenue",
    header: "Other Revenues",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("total_other_revenue")).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "profit",
    header: "Purchases",
    cell: ({ row }) => {
      const sp = row.original.total_selling_price;
      const or = row.original.total_other_revenue;
      const bp = row.original.total_buying_price;
      const ex = row.original.total_expenses;
      const comm = row.original.total_commissions;
      return Number(
        Number(
          Number(sp) + Number(or) - (Number(bp) + Number(ex) + Number(comm))
        ).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "margin",
    header: "Purchases",
    cell: ({ row }) => {
      const sp = row.original.total_selling_price;
      const or = row.original.total_other_revenue;
      const bp = row.original.total_buying_price;
      const ex = row.original.total_expenses;
      const comm = row.original.total_commissions;
      return `${Number(
        (
          (Number(
            Number(sp) + Number(or) - (Number(bp) + Number(ex) + Number(comm))
          ) /
            (Number(ex) + Number(bp) + Number(comm))) *
          100
        ).toFixed(2)
      )}%`;
    },
  },
];
