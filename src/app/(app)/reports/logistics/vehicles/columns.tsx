"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";

// Define your data type
export interface RevenuesInterface {
  id: string;
  registration: string;
  total_transport: number;
  transport_last_month: number;
  transport_this_month: number;
  total_fuel: number;
  fuel_last_month: number;
  fuel_this_month: number;
}

// Define your columns
export const columns: ColumnDef<RevenuesInterface>[] = [
  {
    accessorKey: "registration",
    header: "Registration",
    cell: ({ row }) => {
      const id = row.original.id as string;
      return (
        <Link
          href={`/logistics/vehicles/view?id=${id}`}
          className="text-primary"
        >
          {row.getValue("registration")}
        </Link>
      );
    },
  },
  {
    accessorKey: "total_transport",
    header: "Total Lease",
    cell: ({ row }) => {
      return Number(row.getValue("total_transport")).toLocaleString();
    },
  },
  {
    accessorKey: "transport_last_month",
    header: "Lease Last Month",
    cell: ({ row }) => {
      return Number(row.getValue("transport_last_month")).toLocaleString();
    },
  },
  {
    accessorKey: "transport_this_month",
    header: "Lease This Month",
    cell: ({ row }) => {
      return Number(row.getValue("transport_this_month")).toLocaleString();
    },
  },
  {
    accessorKey: "total_fuel",
    header: "Total Fuel",
    cell: ({ row }) => {
      return Number(row.getValue("total_fuel")).toLocaleString();
    },
  },
  {
    accessorKey: "fuel_last_month",
    header: "Fuel Last Month",
    cell: ({ row }) => {
      return Number(row.getValue("fuel_last_month")).toLocaleString();
    },
  },
  {
    accessorKey: "fuel_this_month",
    header: "Fuel This Month",
    cell: ({ row }) => {
      const { transport_this_month, fuel_this_month } = row.original;
      return Number(fuel_this_month).toLocaleString();
    },
  },
];
