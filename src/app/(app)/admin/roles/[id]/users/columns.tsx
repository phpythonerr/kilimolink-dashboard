"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

interface UserWithProfile {
  id: string;
  email: string;
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    user_type?: string;
  };
  created_at: string;
  role_assignment: {
    created_at: string;
  };
}

export const columns: ColumnDef<UserWithProfile>[] = [
  {
    accessorKey: "profile",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const firstName = user.profile?.first_name || "";
      const lastName = user.profile?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Unnamed User";
      const avatarUrl = user.profile?.avatar_url;

      // Create initials from first and last name
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
    accessorKey: "profile.user_type",
    header: "User Type",
    cell: ({ row }) => {
      const userType = row.original.profile?.user_type || "Unknown";
      return (
        <Badge variant="outline" className="capitalize">
          {userType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "User Created",
    cell: ({ row }) => {
      const date = row.original.created_at
        ? format(new Date(row.original.created_at), "MMM d, yyyy")
        : "Unknown";
      return date;
    },
  },
  {
    accessorKey: "role_assignment.created_at",
    header: "Role Assigned On",
    cell: ({ row }) => {
      const date = row.original.role_assignment?.created_at
        ? format(
            new Date(row.original.role_assignment.created_at),
            "MMM d, yyyy"
          )
        : "Unknown";
      return date;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userId = row.original.id;

      return (
        <div className="flex gap-2">
          <Link
            href={`/admin/users/${userId}`}
            className="text-sm text-primary hover:underline"
          >
            View Profile
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link
            href={`/admin/users/${userId}/roles`}
            className="text-sm text-primary hover:underline"
          >
            Manage Roles
          </Link>
        </div>
      );
    },
  },
];
