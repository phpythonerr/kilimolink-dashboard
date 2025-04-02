"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";

// Define data types

interface UserMetadata {
  tradeName?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
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
  created_date: string;
  product_id: Product;
  quantity: number;
  product_uom: string;
  unit_price: number;
  payment_status: "unpaid" | "paid" | "cancelled";
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
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => {
      const { user_obj: user } = row.original;

      const tradeName = user.user_metadata?.tradeName;
      const firstName =
        user.user_metadata?.first_name || user.user_metadata?.firstName;
      const lastName =
        user.user_metadata?.last_name || user.user_metadata?.lastName;

      const dispayName = tradeName
        ? `${firstName} ${lastName} (${tradeName})`
        : `${firstName} ${lastName}`;

      return (
        <Link
          href={`/users/vendors/view?id=${user?.id}`}
          className="text-primary"
        >{`${dispayName || "Unknown Vendor"}`}</Link>
      );
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const {
        product_id: { name, id },
      } = row.original;
      return (
        <Link href={`/store/products/view?id=${id}`} className="text-primary">
          {name}
        </Link>
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
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const { payment_status } = row.original;
      return `${payment_status}`;
    },
  },
];
