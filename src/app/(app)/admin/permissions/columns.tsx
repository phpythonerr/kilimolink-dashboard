"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Permission {
  id: string;
  name: string;
  description: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export const columns: ColumnDef<Permission>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const permission: Permission = row.original;
      return <div className="font-medium">{permission.name}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] truncate">
          {row.original.description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return format(date, "MMM d, yyyy");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const permission = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/permissions/${permission.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Permission</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/permissions/${permission.id}/roles`}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>View Roles</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
