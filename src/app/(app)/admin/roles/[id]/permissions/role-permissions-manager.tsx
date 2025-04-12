"use client";

import { useState } from "react";
import { Role, Permission } from "@/lib/supabase/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assignPermissionsToRole, removePermissionsFromRole } from "./actions";

interface RolePermissionsManagerProps {
  role: Role;
  permissions: Permission[];
  assignedPermissionIds: string[];
}

export function RolePermissionsManager({
  role,
  permissions,
  assignedPermissionIds,
}: RolePermissionsManagerProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    assignedPermissionIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handlePermissionChange = (checked: boolean, permissionId: string) => {
    setSelectedPermissions((prev) =>
      checked
        ? [...prev, permissionId]
        : prev.filter((id: any) => id !== permissionId)
    );
  };

  const handleSavePermissions = async () => {
    if (isSaving) return;

    setIsSaving(true);

    // Determine which permissions to add and which to remove
    const permissionsToAdd = selectedPermissions.filter(
      (id) => !assignedPermissionIds.includes(id)
    );
    const permissionsToRemove = assignedPermissionIds.filter(
      (id) => !selectedPermissions.includes(id)
    );

    try {
      // Process additions and removals
      if (permissionsToAdd.length > 0) {
        const addResult = await toast.promise(
          assignPermissionsToRole(role.id, permissionsToAdd),
          {
            loading: "Assigning permissions...",
            success: null,
            error: null,
          }
        );

        if (addResult.error) {
          toast.error(`Error assigning permissions: ${addResult.error}`);
          return;
        }
      }

      if (permissionsToRemove.length > 0) {
        const removeResult = await toast.promise(
          removePermissionsFromRole(role.id, permissionsToRemove),
          {
            loading: "Removing permissions...",
            success: null,
            error: null,
          }
        );

        if (removeResult.error) {
          toast.error(`Error removing permissions: ${removeResult.error}`);
          return;
        }
      }

      toast.success("Role permissions updated successfully");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    selectedPermissions.length !== assignedPermissionIds.length ||
    selectedPermissions.some((id: any) => !assignedPermissionIds.includes(id));

  // Filter permissions based on search query
  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Permissions for {role.name}</CardTitle>
        <CardDescription>
          Select the permissions to assign to this role. Users with this role
          will have all the selected permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-4">
              {filteredPermissions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No permissions found matching your search.
                </div>
              ) : (
                filteredPermissions.map((permission: any) => (
                  <div
                    key={permission.id}
                    className="flex items-start space-x-3 py-2"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        handlePermissionChange(checked === true, permission.id);
                      }}
                    />
                    <div className="grid gap-1">
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSavePermissions}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
