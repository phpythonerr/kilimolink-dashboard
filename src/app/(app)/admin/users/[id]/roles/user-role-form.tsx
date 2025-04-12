"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assignUserRole } from "./actions";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define interface for the role objects
interface Role {
  id: string;
  name: string;
  description?: string;
}

// Define form schema
const formSchema = z.object({
  roleId: z.string({
    required_error: "Please select a role to assign",
  }),
});

export function UserRoleForm({
  userId,
  availableRoles,
}: {
  userId: string;
  availableRoles: Role[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roleId: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const result = await assignUserRole(userId, values.roleId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Role assigned successfully");
        form.reset();
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to assign role");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={availableRoles.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                    {availableRoles.length === 0 && (
                      <SelectItem value="none" disabled>
                        No available roles to assign
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {availableRoles.length === 0
                  ? "User already has all available roles assigned"
                  : "Select a role to assign to this user"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || availableRoles.length === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Assign Role
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
