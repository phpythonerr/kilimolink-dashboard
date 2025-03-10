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
import { Checkbox } from "@/components/ui/checkbox";
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
import { createRevenue } from "./actions";

interface RevenueType {
  id: string;
  name: string;
}

interface FormProps {
  revenueTypes: ExpenseType[];
}

const formSchema = z.object({
  deliveryDate: z.string(),
  revenueType: z.string(),
  amount: z.string(),
  vat_rule: z.string(),
  description: z.string(),
  invoiceable: z.boolean().default(false).optional(),
  orderID: z.string().default(""),
});

type FormData = z.infer<typeof formSchema>;

export default function NewRevenueForm({ revenueTypes, orders }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revenueTypePopoverOpen, setRevenueTypePopoverOpen] = useState(false);
  const [ordersPopoverOpen, setOrdersPopoverOpen] = useState(false);
  const { push } = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryDate: "",
      revenueType: "",
      amount: "",
      vat_rule: "",
      description: "",
      invoiceable: false,
      orderID: "",
    },
  });

  const invoiceable = form.watch("invoiceable");

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await createRevenue(formData);
      if (response.success) {
        form.reset({
          deliveryDate: "",
          revenueType: "",
          amount: "",
          vat_rule: "",
          description: "",
          invoiceable: false,
          orderID: "",
        });

        toast.success(
          "Revenue added successfully. You will be redirected shortly"
        );
        push("/accounting/revenues");
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
          name="expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revenue Type</FormLabel>
              <Popover
                open={revenueTypePopoverOpen}
                onOpenChange={setRevenueTypePopoverOpen}
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
                        ? revenueTypes.find(
                            (revType) => revType?.id === field.value
                          )?.name
                        : "Select RevenueType"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search revenue type..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No revenue type found.</CommandEmpty>
                      <CommandGroup>
                        {revenueTypes.map((revType: any) => (
                          <CommandItem
                            value={revType?.name}
                            key={revType?.id}
                            onSelect={() => {
                              form.setValue("revenueType", revType?.id);
                              setRevenueTypePopoverOpen(false);
                            }}
                          >
                            {revType?.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                revType?.id === field.value
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

        <FormField
          control={form.control}
          name="invoiceable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Add to Invoice</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {invoiceable && (
          <FormField
            control={form.control}
            name="orderID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order #</FormLabel>
                <Popover
                  open={ordersPopoverOpen}
                  onOpenChange={setOrdersPopoverOpen}
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
                          ? `${
                              orders.find((order) => order?.id === field.value)
                                ?.order_number
                            } ${
                              orders.find((order) => order?.id === field.value)
                                ?.user_obj?.user_metadata?.business || ""
                            }`
                          : "Select Order"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search order..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No order found.</CommandEmpty>
                        <CommandGroup>
                          {orders.map((order: any) => (
                            <CommandItem
                              value={`${order?.order_number} ${
                                order?.user_obj?.user_metadata?.business || ""
                              }`}
                              key={order?.id}
                              onSelect={() => {
                                form.setValue("orderID", order?.id);
                                setOrdersPopoverOpen(false);
                              }}
                            >
                              {`${order?.order_number} ${
                                order?.user_obj?.user_metadata?.business || ""
                              }`}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  order?.id === field.value
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
