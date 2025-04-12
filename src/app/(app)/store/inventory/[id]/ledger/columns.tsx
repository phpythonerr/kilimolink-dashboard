"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InventoryLedgerItem } from "@/data/inventory";

export const columns: ColumnDef<any>[] = [
  {
    header: "Date",
    accessorKey: "transaction_date",
    cell: ({ row }) => (
      <span>{new Date(row.original.transaction_date).toLocaleString()}</span>
    ),
  },
  {
    header: "Transaction Type",
    accessorKey: "transaction_type",
    cell: ({ row }) => {
      const type = row.original.transaction_type;
      return (
        <span
          className={
            type === "purchase" || type === "initial"
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {type === "purchase" || type === "initial" ? "Stock In" : "Stock Out"}
        </span>
      );
    },
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => {
      const item = row.original;
      const prefix =
        item.transaction_type === "purchase" ||
        item.transaction_type === "initial"
          ? "+"
          : "-";
      return (
        <span
          className={
            item.transaction_type === "purchase" ||
            item.transaction_type === "initial"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
        >
          {prefix}
          {Math.abs(item.change_quantity)} {item.uom}
        </span>
      );
    },
  },
];
