"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createExpense } from "./actions";

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
  deliveryDate: z.string().default(""),
  txnDate: z.string().default(""),
  expense_type: z.string().min(1, "Expense type is required"),
  object_identifier: z.string(),
  amount: z.string().min(1, "Amount is required"),
  txn_reference_code: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewExpenseForm({ expenseTypes, vehicles }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseTypePopoverOpen, setExpenseTypePopoverOpen] = useState(false);
  const [vehiclePopoverOpen, setVehiclePopoverOpen] = useState(false);
  const { push } = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryDate: "",
      txnDate: "",
      expense_type: "",
      object_identifier: "",
      amount: "",
      txn_reference_code: "",
      description: "",
    },
  });

  const selectedExpenseType = form.watch("expense_type");

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await createExpense(formData);
      if (response.success) {
        form.reset({
          deliveryDate: "",
          txnDate: "",
          expense_type: "",
          object_identifier: "",
          amount: "",
          txn_reference_code: "",
          description: "",
        });

        toast.success(
          "Expense added successfully. You will be redirected shortly"
        );
        push("/accounting/expenses/other");
      }
      if (response.error) {
        if (response.code === "VALIDATION_ERROR") {
          // Handle validation errors
          form.setError(response.field as any, {
            message: response.error,
          });
        } else {
          // Handle other errors
          toast.error(response.error);
        }
      }
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="txnDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Expense Incurred</FormLabel>
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
          name="expense_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type</FormLabel>
              <Popover
                open={expenseTypePopoverOpen}
                onOpenChange={setExpenseTypePopoverOpen}
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
                        ? expenseTypes.find(
                            (expType) => expType?.id === field.value
                          )?.name
                        : "Select Expense Type"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search expense type..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No expense type found.</CommandEmpty>
                      <CommandGroup>
                        {expenseTypes.map((expType: any) => (
                          <CommandItem
                            value={expType?.name}
                            key={expType?.id}
                            onSelect={() => {
                              form.setValue("expense_type", expType?.id);
                              setExpenseTypePopoverOpen(false);
                            }}
                          >
                            {expType?.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                expType?.id === field.value
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

        {(selectedExpenseType === "f9bb215a-e1fd-4391-bd1c-e309521d3b51" ||
          selectedExpenseType === "f91e7f54-a63c-47d3-b7d5-49e3babd0ce6") && (
          <FormField
            control={form.control}
            name="object_identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Popover
                  open={vehiclePopoverOpen}
                  onOpenChange={setVehiclePopoverOpen}
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
                          ? vehicles.find(
                              (vehicle) => vehicle?.id === field.value
                            )?.registration
                          : "Select Vehicle"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search vehicle..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {vehicles.map((vehicle: any) => (
                            <CommandItem
                              value={vehicle?.registration}
                              key={vehicle?.id}
                              onSelect={() => {
                                form.setValue("object_identifier", vehicle?.id);
                                setVehiclePopoverOpen(false);
                              }}
                            >
                              {vehicle?.registration}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  vehicle?.id === field.value
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
        )}

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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="" className="resize-none" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </form>
    </Form>
  );
}
