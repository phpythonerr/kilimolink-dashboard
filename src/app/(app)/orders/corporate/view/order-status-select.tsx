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
import { updateOrderStatus } from "./actions";
import { Loader2 } from "lucide-react";

interface OrderStatusSelectProps {
  orderId: string;
  defaultValue: string;
}

export function OrderStatusSelect({
  orderId,
  defaultValue,
}: OrderStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (value: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    await toast.promise(updateOrderStatus(orderId, value), {
      loading: "Updating order status...",
      success: (result) => {
        if (result.error) throw new Error(result.error);
        return "Order status updated successfully";
      },
      error: "Failed to update order status",
      finally: () => setIsUpdating(false),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={defaultValue}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Received">Received</SelectItem>
          <SelectItem value="Processing">Processing</SelectItem>
          <SelectItem value="In-Transit">In-Transit</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
}
