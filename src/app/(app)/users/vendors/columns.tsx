"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

interface UserMetadata {
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  tradeName?: string;
}

// Update User interface with all required properties
export interface User {
  id: string;
  business_name: string;
  first_name: string;
  last_name: string;
  created_at: string;
  status?: "active" | "inactive";
}

// Define your columns
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Vendor Name",
    cell: ({ row }) => {
      const tradeName = row.original?.business_name;
      const firstName = row.original?.first_name;
      const lastName = row.original?.last_name;

      const dispayName = tradeName
        ? `${firstName} ${lastName} (${tradeName})`
        : `${firstName} ${lastName}`;

      return (
        <Link
          href={`/users/vendors/view?id=${row.original.id}`}
          className="text-primary"
        >{`${dispayName || "Unknown Vendor"}`}</Link>
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
