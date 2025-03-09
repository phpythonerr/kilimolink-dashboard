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
    accessorKey: "chasis_no",
    header: "Chasis No.",
    cell: ({ row }) => {
      return row.getValue("chasis_no");
    },
  },
  {
    accessorKey: "vehicle_type",
    header: "Vehicle Type",
    cell: ({ row }) => {
      return row.getValue("vehicle_type");
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      return row.getValue("capacity");
    },
  },
];
