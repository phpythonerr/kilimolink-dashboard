"use client";

import { useState } from "react";
import { Role } from "@/lib/supabase/types";
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
import { MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteRole } from "./actions";
import { toast } from "sonner";

interface RolesListProps {
  roles: Role[];
}

export function RolesList({ roles }: RolesListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteRole = async (id: string) => {
    if (isDeleting) return;

    setIsDeleting(id);
    try {
      await toast.promise(deleteRole(id), {
        loading: "Deleting role...",
        success: "Role deleted successfully",
        error: "Failed to delete role",
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to delete role:", error);
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
        {roles.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center py-4 text-muted-foreground"
            >
              No roles found. Create your first role.
            </TableCell>
          </TableRow>
        ) : (
          roles.map((role: any) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
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
                      onClick={() => router.push(`/admin/roles/${role.id}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/roles/${role.id}/permissions`)
                      }
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={isDeleting === role.id}
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
