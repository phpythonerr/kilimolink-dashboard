"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createRole, updateRole } from "./actions";
import { Role } from "@/lib/supabase/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().min(1, { message: "Role description is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleFormProps {
  role?: Role;
}

export function RoleForm({ role }: RoleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!role;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);

    try {
      const action = isEditing
        ? updateRole(role.id, formData)
        : createRole(formData);

      const result = await toast.promise(action, {
        loading: isEditing ? "Updating role..." : "Creating role...",
        success: null,
        error: null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing ? "Role updated successfully" : "Role created successfully"
      );
      router.push("/admin/roles");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Role" : "Create New Role"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the role details below"
            : "Define a new role in the system"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Administrator" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the role as it will appear in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role's purpose and responsibilities"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this role is for and what it can
                    do.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/roles")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>{isEditing ? "Updating..." : "Creating..."}</span>
              ) : (
                <span>{isEditing ? "Update Role" : "Create Role"}</span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
