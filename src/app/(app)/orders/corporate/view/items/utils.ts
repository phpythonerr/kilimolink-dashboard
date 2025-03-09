import { OrderItem } from "./types";

export function calculateTotals(item: OrderItem) {
  const quantity = Number(item.quantity) || 0;
  const buyingPrice = Number(item.buying_price) || 0;
  const sellingPrice = Number(item.selling_price) || 0;

  const totalCost = quantity * buyingPrice;
  const totalPrice = quantity * sellingPrice;
  const profit = totalPrice - totalCost;
  const margin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0;

  return {
    totalCost: totalCost.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
    profit: profit.toFixed(2),
    margin: margin.toFixed(1) + "%",
  };
}

export function createEmptyItem(): OrderItem {
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
