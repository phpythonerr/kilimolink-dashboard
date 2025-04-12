"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Key, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserWithMetadata extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    avatar?: string;
    business_name?: string;
    user_type?: string;
  };
  app_metadata: {
    role?: string;
  };
}

export const columns: ColumnDef<UserWithMetadata>[] = [
  {
    accessorKey: "user_metadata",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const firstName = user?.first_name || "";
      const lastName = user?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "Unnamed User";
      const avatarUrl = user?.avatar;

      const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{fullName}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "app_metadata.role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.app_metadata?.role || "No Role";
      return <Badge variant="outline">{role}</Badge>;
    },
  },
  //   {
  //     accessorKey: "created_at",
  //     header: "Joined",
  //     cell: ({ row }) => {
  //       const date = new Date(row.original.created_at) || new Date();
  //       return <span>{date.toLocaleDateString()}</span>;
  //     },
  //   },
  {
    accessorKey: "last_sign_in_at",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.original.last_sign_in_at
        ? new Date(row.original.last_sign_in_at)
        : null;
      return <span>{date ? date.toLocaleDateString() : "Never"}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              <Link href={`/admin/users/${user.id}/roles`}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Manage Roles</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}/permissions`}>
                <Key className="mr-2 h-4 w-4" />
                <span>Manage Permissions</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
