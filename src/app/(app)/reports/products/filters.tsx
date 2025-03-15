"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const FilterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof FilterSchema>;

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FilterValues>({
    resolver: zodResolver(FilterSchema),
    defaultValues: {
      search: searchParams.get("search") || "",
    },
  });

  function onSubmit(data: FilterValues) {
    const params = new URLSearchParams();
    if (data.search) params.set("search", data.search);

    router.push(`?${params.toString()}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-4">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Search Products..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-end space-x-2">
          <Button type="submit" className="cursor-pointer">
            <Search className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => {
              form.reset();
              router.push("?");
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
