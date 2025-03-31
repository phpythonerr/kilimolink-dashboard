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
  user_metadata: UserMetadata;
  created_at: string;
  status?: "active" | "inactive";
}

// Define your columns
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Name",
    cell: ({ row }) => {
      const firstName =
        row.original.user_metadata?.first_name ||
        row.original.user_metadata?.firstName;
      const lastName =
        row.original.user_metadata?.last_name ||
        row.original.user_metadata?.lastName;

      const dispayName = `${firstName} ${lastName}`;

      return (
        <Link
          href={`/users/farmers/view?id=${row.original.id}`}
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
