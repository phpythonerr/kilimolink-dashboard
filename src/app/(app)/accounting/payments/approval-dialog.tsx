"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { rejectPayment } from "./actions";

const createFormSchema = (action: "approv" | "reject") =>
  z.object({
    source_of_funds: z.string().refine(
      (val) => {
        if (action === "approv") {
          return val.length > 0;
        }
        return true;
      },
      { message: "Source of Funds is required for payment approval" }
    ),
    note: z.string().optional(),
  });

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  action: "approv" | "reject";
}

export function ApprovalDialog({
  open,
  onOpenChange,
  paymentId,
  action,
}: ApprovalDialogProps) {
  const schema = useMemo(() => createFormSchema(action), [action]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      source_of_funds: "",
      note: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const formData = new FormData();
      formData.append("paymentId", paymentId);
      formData.append("action", action);
      formData.append("note", values.note || "");
      formData.append("source_of_funds", values?.source_of_funds || ""); // Use empty string if not approving

      if (action === "approv") {
        formData.append("source_of_funds", values.source_of_funds);
        // Handle approval...
      } else {
        const result = await rejectPayment(formData);
        if (result.error) throw new Error(result.error);
      }

      toast.success(`Payment ${action}ed successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to process payment. Please try again");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle className="capitalize">
            {action === "approv" ? "Approve" : action} Payment
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {action === "approv" && (
              <FormField
                control={form.control}
                name="source_of_funds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex gap-1">
                        <span>Source of Funds</span>
                        <span className="text-destructive">*</span>
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          Lolkirr I&M Acc No. 9000000
                        </SelectItem>
                        <SelectItem value="3">
                          Kilimolink I&M Acc No. 9000000
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Enter reason for ${action}ing payment...`}
                      {...field}
                      className="min-h-[150px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant={action === "approv" ? "default" : "destructive"}
            >
              {action === "approv" ? "Approve Payment" : "Reject Payment"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
