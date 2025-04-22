"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getOrdersByDeliveryDate,
  getOrderItemsByOrderId,
  toggleFulfillment,
} from "./actions";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define types matching the ones in actions.ts
interface Order {
  id: string;
  order_number: string;
  branch: string | null;
  delivery_date: string;
  user: string | null;
  profiles: {
    business_name: string | null;
  } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  fulfilled: boolean;
  commodity_id: string;
  commodities_commodity: {
    // Changed from inventory_commodity
    name: string;
  } | null;
}

// Helper function to format date string
const formatDateHuman = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00"); // Ensure correct date parsing
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function RecordSalesForm() {
  const [selectedDateOption, setSelectedDateOption] = useState<
    "today" | "tomorrow" | ""
  >("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [isLoadingOrders, startLoadingOrdersTransition] = useTransition();
  const [isLoadingItems, startLoadingItemsTransition] = useTransition();
  const [isToggling, startToggleTransition] = useTransition();
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  // Fetch orders when date option changes
  useEffect(() => {
    if (!selectedDateOption) {
      setOrders([]);
      setSelectedOrderId(""); // Reset order selection
      setOrderItems([]); // Reset items
      return;
    }

    startLoadingOrdersTransition(async () => {
      setSelectedOrderId(""); // Reset order selection when date changes
      setOrderItems([]); // Reset items when date changes
      const fetchedOrders = await getOrdersByDeliveryDate(selectedDateOption);
      setOrders(fetchedOrders);
      if (fetchedOrders.length === 0) {
        toast.info(`No orders found for delivery ${selectedDateOption}.`);
      }
    });
  }, [selectedDateOption]);

  // Fetch order items when order ID changes
  useEffect(() => {
    if (!selectedOrderId) {
      setOrderItems([]); // Clear items if no order is selected
      return;
    }

    startLoadingItemsTransition(async () => {
      const items = await getOrderItemsByOrderId(selectedOrderId);
      setOrderItems(items);
      if (items.length === 0) {
        // This might happen if an order genuinely has no items, or an error occurred
        // getOrderItemsByOrderId handles console logging errors
        toast.info("No items found for this order or failed to load items.");
      }
    });
  }, [selectedOrderId]);

  const handleToggleFulfillment = (item: OrderItem) => {
    setTogglingItemId(item.id);
    startToggleTransition(async () => {
      const result = await toggleFulfillment(
        item.id,
        item.commodity_id, // Pass commodity_id
        item.quantity,
        item.fulfilled
      );

      if (result.success) {
        toast.success(
          `Item ${item.fulfilled ? "unfulfilled" : "fulfilled"} successfully.`
        );
        // Optimistically update UI
        setOrderItems((prevItems) =>
          prevItems.map((prevItem: any) =>
            prevItem.id === item.id
              ? { ...prevItem, fulfilled: !prevItem.fulfilled }
              : prevItem
          )
        );
      } else {
        toast.error(result.error || "Failed to update fulfillment status.");
      }
      setTogglingItemId(null);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Order</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Select
                value={selectedDateOption}
                onValueChange={(value: "today" | "tomorrow" | "") =>
                  setSelectedDateOption(value)
                }
              >
                <SelectTrigger id="deliveryDate" className="w-full">
                  <SelectValue placeholder="Select Delivery Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="orderSelect">Order</Label>
              <Select
                value={selectedOrderId}
                onValueChange={(value: string) => setSelectedOrderId(value)}
                disabled={
                  !selectedDateOption || isLoadingOrders || orders.length === 0
                }
              >
                <SelectTrigger id="orderSelect" className="relative w-full">
                  <SelectValue
                    placeholder={
                      isLoadingOrders ? "Loading orders..." : "Select Order"
                    }
                  />
                  {isLoadingOrders && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order: any) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.order_number} -{" "}
                      {order.profiles?.business_name || "Unknown Business"}
                      {order.branch && ` (${order.branch})`}
                      {` - Delivers ${formatDateHuman(order.delivery_date)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove the old button */}
      {/* <Button onClick={handleFetchTomorrowsItems} disabled={isLoadingItems}> ... </Button> */}

      {(isLoadingItems || orderItems.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingItems ? (
              <div className="flex justify-center items-center p-4">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading
                items...
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                      item.fulfilled ? "bg-green-100 dark:bg-green-900/30" : ""
                    } ${
                      isToggling && togglingItemId === item.id
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={() => !isToggling && handleToggleFulfillment(item)} // Prevent click while toggling
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={item.fulfilled}
                        aria-label={`Mark ${
                          item.commodities_commodity?.name
                        } as ${item.fulfilled ? "unfulfilled" : "fulfilled"}`}
                        className="pointer-events-none" // Prevent double click events
                      />
                      <span>
                        {item.commodities_commodity?.name || "Unknown Product"}
                      </span>
                    </div>
                    <span>Qty: {item.quantity}</span>
                    {isToggling && togglingItemId === item.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
