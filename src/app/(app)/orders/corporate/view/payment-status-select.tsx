"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updatePaymentStatus } from "./actions";
import { Loader2 } from "lucide-react";

interface PaymentStatusSelectProps {
  orderId: string;
  defaultValue: string;
}

export function PaymentStatusSelect({
  orderId,
  defaultValue,
}: PaymentStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePaymentStatusChange = async (value: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    await toast.promise(updatePaymentStatus(orderId, value), {
      loading: "Updating payment status...",
      success: (result) => {
        if (result.error) throw new Error(result.error);
        return "Payment status updated successfully";
      },
      error: "Failed to update payment status",
      finally: () => setIsUpdating(false),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={defaultValue}
        onValueChange={handlePaymentStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Unpaid">Unpaid</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
