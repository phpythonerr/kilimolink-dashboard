"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { createOrder } from "./actions";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  subsidiary: z.string().default("").optional(),
  po_number: z.string().default("").optional(),
  dateCreated: z.string(),
  deliveryDate: z.string(),
});

export default function NewOrderForm({ customers }: any) {
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const { push } = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      subsidiary: "",
      po_number: "",
      dateCreated: new Date().toISOString().split("T")[0],
      deliveryDate: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("customerId", data.customerId);
    formData.append("subsidiary", data.subsidiary || "");
    formData.append("po_number", data.po_number || "");
    formData.append("dateCreated", data.dateCreated);
    formData.append("deliveryDate", data.deliveryDate);

    try {
      const res = await createOrder(formData);
      if (res?.success) {
        toast.success(
          "Order created successfully. Please proceed to enter the ordered items. You will be redirected shortly"
        );
        push(`/orders/corporate/view/items?id=${res?.id}`);
      } else {
        toast?.error(res?.error);
      }
    } catch (error) {
      // Handle error
      toast?.error(`Error submitting form: ${error}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Popover
                open={customerPopoverOpen}
                onOpenChange={setCustomerPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? customers.find(
                            (customer: any) => customer?.id === field.value
                          )?.user_metadata?.business_name
                        : "Select Customer"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search customer..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer: any) => (
                          <CommandItem
                            value={customer?.user_metadata?.business_name}
                            key={customer?.id}
                            onSelect={() => {
                              form.setValue("customerId", customer?.id);
                              setCustomerPopoverOpen(false);
                            }}
                          >
                            {customer?.user_metadata?.business_name}
                            <Check
                              className={cn(
                                "ml-auto",
                                customer?.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subsidiary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subsidiary</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="po_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order Number</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateCreated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Created</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  max={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Continue &raquo;</Button>
      </form>
    </Form>
  );
}
