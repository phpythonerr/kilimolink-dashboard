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
    accessorKey: "name",
    header: "Pricelist",
    cell: ({ row }) => {
      const id = row.original.id as string;
      return (
        <Link href={`/store/pricelists/view?id=${id}`} className="text-primary">
          {row.getValue("name")}
        </Link>
      );
    },
  },
];
