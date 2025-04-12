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

import { createPermission, updatePermission } from "./actions";
import { Permission } from "@/lib/supabase/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Permission name is required" }),
  description: z
    .string()
    .min(1, { message: "Permission description is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface PermissionFormProps {
  permission?: Permission;
}

export function PermissionForm({ permission }: PermissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!permission;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission?.name || "",
      description: permission?.description || "",
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
        ? updatePermission(permission.id, formData)
        : createPermission(formData);

      const result = await toast.promise(action, {
        loading: isEditing
          ? "Updating permission..."
          : "Creating permission...",
        success: null,
        error: null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing
          ? "Permission updated successfully"
          : "Permission created successfully"
      );
      router.push("/admin/permissions");
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
        <CardTitle>
          {isEditing ? "Edit Permission" : "Create New Permission"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the permission details below"
            : "Define a new permission in the system"}
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
                  <FormLabel>Permission Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., create_user" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the permission. Use snake_case for consistency.
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
                      placeholder="Describe what this permission allows"
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear description of what this permission grants access
                    to.
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
              onClick={() => router.push("/admin/permissions")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>{isEditing ? "Updating..." : "Creating..."}</span>
              ) : (
                <span>
                  {isEditing ? "Update Permission" : "Create Permission"}
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
