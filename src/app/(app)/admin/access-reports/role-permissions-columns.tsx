"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  permission: {
    id: string;
    name: string;
    description: string;
    category?: string;
  };
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "role.name",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role.name;
      return (
        <Link
          href={`/admin/roles/${row.original.role_id}`}
          className="font-medium hover:underline"
        >
          {roleName}
        </Link>
      );
    },
  },
  {
    accessorKey: "permission.name",
    header: "Permission",
    cell: ({ row }) => {
      const permissionName = row.original.permission.name;
      return (
        <Link
          href={`/admin/permissions/${row.original.permission_id}`}
          className="font-medium hover:underline"
        >
          {permissionName}
        </Link>
      );
    },
  },
  {
    accessorKey: "permission.category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.permission.category;
      return category ? (
        <Badge variant="outline" className="capitalize">
          {category}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">Uncategorized</span>
      );
    },
  },
  {
    accessorKey: "permission.description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-md truncate">
          {row.original.permission.description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Assigned On",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return format(date, "MMM d, yyyy");
    },
  },
];
