"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleNumberInput } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { initiatePayment } from "./actions";
import { toast } from "sonner";

const createFormSchema = (totalUnpaid: number) =>
  z.object({
    paymentType: z.enum(["full", "partial"], {
      required_error: "Please select a payment type",
    }),
    amount: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const amount = Number(val);
          return !isNaN(amount) && amount > 0 && amount <= 999999;
        },
        { message: "Amount must be between 1 and 999,999" }
      )
      .refine(
        (val) => {
          if (!val) return true;
          const amount = Number(val);
          return amount <= totalUnpaid;
        },
        { message: `Amount must be less than ${totalUnpaid.toLocaleString()}` }
      ),
  });

interface PaymentDialogProps {
  unpaidPurchases: any[];
  totalUnpaid: number;
}

interface PaymentPayload {
  amount: number;
  payment_type: "full" | "partial";
  vendor_id: string;
  purchases: any[];
}

export function PaymentDialog({
  unpaidPurchases,
  totalUnpaid,
}: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const schema = React.useMemo(
    () => createFormSchema(totalUnpaid),
    [totalUnpaid]
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentType: "full",
      amount: "",
    },
  });

  const watchPaymentType = form.watch("paymentType");

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setIsSubmitting(true);
      const amount =
        values.paymentType === "full" ? totalUnpaid : Number(values.amount);

      if (values.paymentType === "partial" && amount >= totalUnpaid) {
        form.setError("amount", {
          message: `Partial payment must be less than full amount (Ksh.${totalUnpaid.toLocaleString()})`,
        });
        return;
      }

      const formData = new FormData();
      formData.append("amount", amount.toString());
      formData.append("payment_type", values.paymentType);
      formData.append("vendor_id", unpaidPurchases[0]?.vendor);

      // Convert purchases array to JSON string before appending
      formData.append("purchases", JSON.stringify(unpaidPurchases));

      const response = await initiatePayment(formData);
      if (response?.success) {
        toast.success("Payment initiated successfully");
        setOpen(false);
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="secondary"
          className="flex gap-1 rounded-lg text-xs cursor-default"
        >
          Initiate Payment
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Initiate Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Payment Option</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="full" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Full Payment (Ksh.{totalUnpaid.toLocaleString()})
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="partial" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Partial Payment
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPaymentType === "partial" && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        {...field}
                        maxLength={6}
                        autoComplete="off"
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          const numValue = Number(value);
                          if (numValue <= 999999) {
                            handleNumberInput(e, value);
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value;

                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-start">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="mr-2">Initiating payment...</span>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </span>
                ) : (
                  "Initiate Payment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
