"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

interface UserMetadata {
  business_name?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
}

// Update User interface with all required properties
export interface User {
  id: string;
  email?: string;
  phone?: string;
  business_name?: string;
  first_name?: string;
  created_at?: string;
  status?: "active" | "inactive";
}

// Define your columns
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Business Name",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const business_name = row.original.business_name as string;
      return (
        <Link
          href={`/users/customers/corporate/view?id=${id}`}
          className="text-primary"
        >{`${
          business_name ||
          row.original.email ||
          row.original.first_name ||
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
