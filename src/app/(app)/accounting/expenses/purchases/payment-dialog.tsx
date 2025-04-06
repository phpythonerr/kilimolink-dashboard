"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z
  .object({
    paymentMode: z.enum(["mpesa", "bank", "cash"], {
      required_error: "Please select a payment mode",
    }),
    transactionCode: z.string(),
  })
  .refine(
    (data) => {
      if (data.paymentMode !== "cash") {
        return data.transactionCode.length > 0;
      }
      return true;
    },
    {
      message: "Transaction code is required for non-cash payments",
      path: ["transactionCode"],
    }
  );

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseId: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  purchaseId,
}: PaymentDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionCode: "",
      paymentMode: undefined,
    },
  });

  const watchPaymentMode = form.watch("paymentMode");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("transactionCode", values.transactionCode);
      formData.append("paymentMode", values.paymentMode);
      formData.append("purchaseId", purchaseId);

      toast.success("Functionality is currently under development");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
          <DialogDescription>
            Enter the payment details to mark this purchase as paid.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "cash") {
                        form.setValue("transactionCode", "");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchPaymentMode !== "cash" && (
              <FormField
                control={form.control}
                name="transactionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter transaction code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
