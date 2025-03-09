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

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let salaries = 242000;

let rent = 115000;

let server = 25000;

let electricity = 5000;

let security = 5000;

let water = 5000;

let internet = 2500;

let miscellaneous = 99500;

const operationCosts =
  salaries +
  rent +
  server +
  electricity +
  security +
  water +
  internet +
  miscellaneous;

// Define your columns
export const columns: ColumnDef<RevenuesInterface>[] = [
  {
    accessorKey: "month_start_date",
    header: "Month",
    cell: ({ row }) => {
      const month_start_date = row.getValue("month_start_date");
      return `${months[new Date(month_start_date).getMonth()]} ${new Date(
        month_start_date
      ).getFullYear()}`;
    },
  },
  {
    accessorKey: "purchases",
    header: "Purchases",
    cell: ({ row }) => {
      return Number(
        Number(row.getValue("purchases")).toFixed(2)
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
    accessorKey: "operations",
    header: "Operations",
    cell: ({ row }) => {
      return Number(Number(operationCosts).toFixed(2)).toLocaleString();
    },
  },
  {
    accessorKey: "sales",
    header: "Sales",
    cell: ({ row }) => {
      return Number(Number(row.getValue("sales")).toFixed(2)).toLocaleString();
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
      const sp = row.original.sales;
      const or = row.original.total_other_revenue;
      const bp = row.original.purchases;
      const ex = row.original.total_expenses;
      const comm = row.original.total_commissions;
      return Number(
        Number(
          Number(sp) +
            Number(or) -
            (Number(bp) + Number(ex) + Number(comm) + 50000 + operationCosts)
        ).toFixed(2)
      ).toLocaleString();
    },
  },
  {
    accessorKey: "margin",
    header: "Purchases",
    cell: ({ row }) => {
      const sp = row.original.sales;
      const or = row.original.total_other_revenue;
      const bp = row.original.purchases;
      const ex = row.original.total_expenses;
      const comm = row.original.total_commissions;
      return `${Number(
        (
          (Number(
            Number(sp) +
              Number(or) -
              (Number(bp) + Number(ex) + Number(comm) + 50000 + operationCosts)
          ) /
            (Number(ex) + Number(bp) + Number(comm) + 50000 + operationCosts)) *
          100
        ).toFixed(2)
      )}%`;
    },
  },
];
