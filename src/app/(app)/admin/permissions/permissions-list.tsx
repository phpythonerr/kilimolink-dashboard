"use client";

import { useState } from "react";
import { Permission } from "@/lib/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePermission } from "./actions";
import { toast } from "sonner";

interface PermissionsListProps {
  permissions: Permission[];
}

export function PermissionsList({ permissions }: PermissionsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDeletePermission = async (id: string) => {
    if (isDeleting) return;

    setIsDeleting(id);
    try {
      await toast.promise(deletePermission(id), {
        loading: "Deleting permission...",
        success: "Permission deleted successfully",
        error: "Failed to delete permission",
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to delete permission:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center py-4 text-muted-foreground"
            >
              No permissions found. Create your first permission.
            </TableCell>
          </TableRow>
        ) : (
          permissions.map((permission: any) => (
            <TableRow key={permission.id}>
              <TableCell className="font-medium">{permission.name}</TableCell>
              <TableCell>{permission.description}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-8 w-8">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/permissions/${permission.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePermission(permission.id)}
                      disabled={isDeleting === permission.id}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
