"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "./payment-dialog";

// Define data types

interface UserMetadata {
  tradeName?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  location?: string;
}

interface User {
  id: string;
  user_metadata: UserMetadata;
}

interface Product {
  id: string;
  name: string;
}

export interface PurchasesInterface {
  id: string;
  created_date: string;
  product_id: Product;
  quantity: number;
  product_uom: string;
  unit_price: number;
  payment_status: "unpaid" | "paid" | "cancelled";
  seller_type: string;
  user_obj: User;
}

// Define columns
export const columns: ColumnDef<PurchasesInterface>[] = [
  {
    accessorKey: "purchase_date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("purchase_date")).toDateString();
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const { product_id } = row.original;
      return product_id ? (
        <Link
          href={`/store/products/view?id=${product_id?.id}`}
          className="text-primary"
        >
          {product_id?.name}
        </Link>
      ) : (
        "Unknown Product"
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const { quantity, product_uom } = row.original;
      return `${quantity} ${product_uom}`;
    },
  },
  {
    accessorKey: "unit_price",
    header: "Unit Price",
    cell: ({ row }) => {
      const { unit_price, product_uom } = row.original;
      return `Ksh.${unit_price} / ${product_uom}`;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const { unit_price, quantity } = row.original;
      return `Ksh.${(Number(unit_price) * Number(quantity))
        .toFixed(2)
        .toLocaleString()}`;
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const { payment_status } = row.original;
      return `${payment_status}`;
    },
  },
  {
    accessorKey: "paid_amount",
    header: "Payment Amount",
    cell: ({ row }) => {
      const { paid_amount } = row.original;
      return `Ksh.${Number(paid_amount || 0)
        .toFixed(2)
        .toLocaleString()}`;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const { balance } = row.original;
      return `Ksh.${Number(balance || 0)
        .toFixed(2)
        .toLocaleString()}`;
    },
  },
];
