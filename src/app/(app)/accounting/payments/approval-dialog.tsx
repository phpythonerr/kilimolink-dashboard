"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { rejectPayment, approvePayment } from "./actions";

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
    note:
      action === "reject"
        ? z.string().min(1, "Reason for payment rejection is required")
        : z.string().optional(),
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const schema = useMemo(() => createFormSchema(action), [action]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      source_of_funds: "",
      note: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (isSubmitting) return;

    try {
      const formData = new FormData();
      formData.append("paymentId", paymentId);
      formData.append("note", values.note || "");

      if (action === "approv") {
        formData.append("source_of_funds", values.source_of_funds);

        setIsSubmitting(true);
        await toast.promise(approvePayment(formData), {
          loading: "Approving payment...",
          success: (result) => {
            console.log(result);
            if (result.error) throw Error(result.error);
            onOpenChange(false);
            return "Payment approved successfully";
          },
          error: "Failed to approve payment",
          finally: () => setIsSubmitting(false),
        });
      } else {
        setIsSubmitting(true);
        await toast.promise(rejectPayment(formData), {
          loading: "Rejecting payment...",
          success: (result) => {
            if (result.error) throw Error(result.error);
            onOpenChange(false);
            return "Payment rejected successfully";
          },
          error: "Failed to reject payment",
          finally: () => setIsSubmitting(false),
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
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
                  <FormLabel>
                    <span className="flex gap-1">
                      {action === "reject" && (
                        <>
                          <span>Reason for Payment Rejection</span>
                          <span className="text-destructive">*</span>
                        </>
                      )}
                      {action === "approv" && <span>Note (Optional)</span>}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Enter reason for ${action}ing payment...`}
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant={action === "approv" ? "default" : "destructive"}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : action === "approv" ? (
                "Approve Payment"
              ) : (
                "Reject Payment"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
