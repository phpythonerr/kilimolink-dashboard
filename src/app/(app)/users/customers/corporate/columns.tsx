"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define your data type
export interface User {
  order_number: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  created_at: string;
}

// Define your columns
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Business Name",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const business_name = row.original.user_metadata.business_name as string;
      return (
        <Link
          href={`/users/customers/corporate/view?id=${id}`}
          className="text-primary"
        >{`${
          business_name ||
          row.original.email ||
          row.orginal.user_metadata.first_name ||
          "Business"
        }`}</Link>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toDateString();
    },
  },
];
