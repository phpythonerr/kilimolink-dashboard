"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      first_name?: string;
      last_name?: string;
      avatar?: string;
      user_type?: string;
    };
  };
  role: {
    id: string;
    name: string;
    description: string;
  };
}

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      const firstName = user.user_metadata?.first_name || "";
      const lastName = user.user_metadata?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Unnamed User";
      const avatarUrl = user.user_metadata?.avatar;
      const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/admin/users/${user.id}`}
              className="font-medium hover:underline"
            >
              {fullName}
            </Link>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user.user_metadata.user_type",
    header: "User Type",
    cell: ({ row }) => {
      const userType = row.original.user.user_metadata?.user_type || "Unknown";
      return (
        <Badge variant="outline" className="capitalize">
          {userType}
        </Badge>
      );
    },
  },
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
    accessorKey: "role.description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-md truncate">
          {row.original.role.description || "No description"}
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
