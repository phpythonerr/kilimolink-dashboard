import { useState } from "react";
import { OrderItem } from "../types";

function createEmptyItem(): OrderItem {
  return {
    id: "no_item",
    commodity_id: null,
    buying_price: "",
    selling_price: "",
    quantity: "",
    uom: "no_uom",
    note: "",
    customer: "",
    loading: false,
  };
}

function mapInitialItems(items: OrderItem[]): OrderItem[] {
  if (!items || items.length === 0) {
    return [createEmptyItem()];
  }
  return items.map((item) => ({
    ...item,
    loading: false,
    buying_price: item.buying_price || "",
    selling_price: item.selling_price || "",
    quantity: item.quantity || "",
    uom: item.uom || "no_uom",
  }));
}

export function useOrderItems(initialItems: OrderItem[]) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    mapInitialItems(initialItems)
  );
  const [productPopoverOpenStates, setProductPopoverOpenStates] = useState<
    boolean[]
  >(new Array(initialItems.length).fill(false));

  const addItem = () => {
    setOrderItems([...orderItems, createEmptyItem()]);
    setProductPopoverOpenStates([...productPopoverOpenStates, false]);
  };

  const removeItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems.length ? newItems : [createEmptyItem()]);

    const newStates = [...productPopoverOpenStates];
    newStates.splice(index, 1);
    setProductPopoverOpenStates(newStates);
  };

  return {
    orderItems,
    setOrderItems,
    productPopoverOpenStates,
    setProductPopoverOpenStates,
    addItem,
    removeItem,
  };
}
