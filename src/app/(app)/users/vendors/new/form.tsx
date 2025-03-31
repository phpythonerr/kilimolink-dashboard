"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createVendor } from "./actions";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  tradeName: z.string().min(1, "Trade Name is required"),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  location: z.string().min(1, "Location is required"),
});

export default function NewVendorForm() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { push } = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      tradeName: "",
      phoneNumber: "",
      location: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (submitting) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("tradeName", data.tradeName);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("location", data.location);

    await toast.promise(createVendor(formData), {
      loading: "Registering vendor...",
      success: (res) => {
        if (res?.success) {
          push(`/users/vendors/`);
          return "Vendor registered successfully.";
        }
        throw new Error(
          res?.error || "Failed to register vendor. Please try again"
        );
      },
      error: (err) => {
        setSubmitting(false);
        return err instanceof Error ? err.message : "Failed to register vendor";
      },
      finally: () => {
        setSubmitting(false);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="tradeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trading Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Marikiti">Marikiti</SelectItem>
                  <SelectItem value="City Park">City Park</SelectItem>
                  <SelectItem value="Kangemi">Kangemi</SelectItem>
                  <SelectItem value="Kikuyu">Kikuyu</SelectItem>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Please wait
            </>
          ) : (
            "Create Vendor"
          )}
        </Button>
      </form>
    </Form>
  );
}
