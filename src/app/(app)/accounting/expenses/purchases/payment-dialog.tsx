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
import { markAsPaid } from "./actions";

const formSchema = z.object({
  paymentMode: z.enum(["mpesa", "bank", "cash"], {
    required_error: "Please select a payment mode",
  }),
  transactionCode: z.string().optional(),
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionCode: "",
      paymentMode: undefined,
    },
  });

  const watchPaymentMode = form.watch("paymentMode");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    try {
      const formData = new FormData();
      formData.append("purchaseId", purchaseId);
      formData.append("paymentMode", values.paymentMode);
      formData.append("transactionCode", values.transactionCode || "");

      setIsSubmitting(true);
      await toast.promise(markAsPaid(formData), {
        loading: "Updating payment status...",
        success: (result) => {
          console.log(result);
          if (result.error) throw new Error(result.error);
          onOpenChange(false);
          return "Purchase marked as paid successfully";
        },
        error: "Failed to update payment status",
        finally: () => setIsSubmitting(false),
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
