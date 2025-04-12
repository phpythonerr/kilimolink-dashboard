"use client";

import { useState } from "react";
import { Role } from "@/lib/supabase/types";
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
import { assignRolesToUser, removeRolesFromUser } from "./actions";

interface UserRolesManagerProps {
  userId: string;
  userName: string;
  roles: Role[];
  assignedRoleIds: string[];
}

export function UserRolesManager({
  userId,
  userName,
  roles,
  assignedRoleIds,
}: UserRolesManagerProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    assignedRoleIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleRoleChange = (checked: boolean, roleId: string) => {
    setSelectedRoles((prev) =>
      checked ? [...prev, roleId] : prev.filter((id: any) => id !== roleId)
    );
  };

  const handleSaveRoles = async () => {
    if (isSaving) return;

    setIsSaving(true);

    // Determine which roles to add and which to remove
    const rolesToAdd = selectedRoles.filter(
      (id: any) => !assignedRoleIds.includes(id)
    );
    const rolesToRemove = assignedRoleIds.filter(
      (id: any) => !selectedRoles.includes(id)
    );

    try {
      // Process additions and removals
      if (rolesToAdd.length > 0) {
        const addResult = await toast.promise(
          assignRolesToUser(userId, rolesToAdd),
          {
            loading: "Assigning roles...",
            success: null,
            error: null,
          }
        );

        if (addResult.error) {
          toast.error(`Error assigning roles: ${addResult.error}`);
          return;
        }
      }

      if (rolesToRemove.length > 0) {
        const removeResult = await toast.promise(
          removeRolesFromUser(userId, rolesToRemove),
          {
            loading: "Removing roles...",
            success: null,
            error: null,
          }
        );

        if (removeResult.error) {
          toast.error(`Error removing roles: ${removeResult.error}`);
          return;
        }
      }

      toast.success("User roles updated successfully");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    selectedRoles.length !== assignedRoleIds.length ||
    selectedRoles.some((id: any) => !assignedRoleIds.includes(id));

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Roles for {userName}</CardTitle>
        <CardDescription>
          Select the roles to assign to this user. Each role grants a set of
          permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[400px] rounded-md border">
            <div className="p-4 space-y-4">
              {filteredRoles.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No roles found matching your search.
                </div>
              ) : (
                filteredRoles.map((role: any) => (
                  <div
                    key={role.id}
                    className="flex items-start space-x-3 py-2"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        handleRoleChange(checked === true, role.id);
                      }}
                    />
                    <div className="grid gap-1">
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveRoles} disabled={!hasChanges || isSaving}>
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
