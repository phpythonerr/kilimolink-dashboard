"use client";

import { useState } from "react";
import { Permission } from "@/lib/supabase/types";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { assignPermissionsToUser, removePermissionsFromUser } from "./actions";

interface UserPermissionsManagerProps {
  userId: string;
  userName: string;
  permissions: Permission[];
  assignedPermissionIds: string[];
  rolePermissionIds: string[];
}

export function UserPermissionsManager({
  userId,
  userName,
  permissions,
  assignedPermissionIds,
  rolePermissionIds,
}: UserPermissionsManagerProps) {
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
          assignPermissionsToUser(userId, permissionsToAdd),
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
          removePermissionsFromUser(userId, permissionsToRemove),
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

      toast.success("User permissions updated successfully");
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
        <CardTitle>Manage Direct Permissions for {userName}</CardTitle>
        <CardDescription>
          Assign specific permissions directly to this user, in addition to
          those granted by their roles.
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
                filteredPermissions.map((permission: any) => {
                  const isFromRole = rolePermissionIds.includes(permission.id);

                  return (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 py-2"
                    >
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={
                          selectedPermissions.includes(permission.id) ||
                          isFromRole
                        }
                        onCheckedChange={(checked) => {
                          if (!isFromRole) {
                            handlePermissionChange(
                              checked === true,
                              permission.id
                            );
                          }
                        }}
                        disabled={isFromRole}
                      />
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {permission.name}
                          </label>
                          {isFromRole && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-help"
                                  >
                                    From Role{" "}
                                    <InfoIcon className="h-3 w-3 ml-1" />
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    This permission is granted via the user's
                                    assigned roles
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  );
                })
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
