"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import type { InventoryItem } from "@/data/inventory";

export const columns: ColumnDef<InventoryItem>[] = [
  {
    header: "Product",
    accessorKey: "product_name",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Link
          href={`/store/inventory/${item.id}/ledger`}
          className="text-primary font-medium"
        >
          {item.product_name}
        </Link>
      );
    },
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => (
      <span>
        {row.original.quantity} {row.original.unit}
      </span>
    ),
  },
  {
    header: "Last Updated",
    accessorKey: "last_updated",
    cell: ({ row }) => (
      <span>{new Date(row.original.last_updated).toLocaleString()}</span>
    ),
  },
];
