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

interface ExpenseType {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  registration: string;
}

interface FormProps {
  expenseTypes: ExpenseType[];
  vehicles: Vehicle[];
}

const formSchema = z.object({
  orderDate: z.string(),
  txnDate: z.string(),
  customerId: z.string().min(1, "Customer is required"),
  amount: z.string().min(1, "Amount is required"),
  txn_reference_code: z.string().min(1, "Transaction code is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function NewExpenseForm({ expenseTypes, vehicles }: FormProps) {
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  // const { push } = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split("T")[0],
      txnDate: new Date().toISOString().split("T")[0],
      customerId: "",
      amount: "",
      txn_reference_code: "",
    },
  });

  async function onSubmit(data: FormData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="orderDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Date</FormLabel>
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

        {/* <FormField
          control={form.control}
          name="txnDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Expense Incurred</FormLabel>
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
                            (customer) => customer?.id === field.value
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
        /> */}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="txn_reference_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Code</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save &raquo;</Button>
      </form>
    </Form>
  );
}
