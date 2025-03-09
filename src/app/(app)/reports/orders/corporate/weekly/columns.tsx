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
    accessorKey: "week_start_date",
    header: "Week",
    cell: ({ row }) => {
      const week_start_date = row.getValue("week_start_date");
      return `${new Date(week_start_date).toDateString()} - ${new Date(
        new Date(week_start_date).setDate(
          new Date(week_start_date).getDate() + 6
        )
      ).toDateString()}`;
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
