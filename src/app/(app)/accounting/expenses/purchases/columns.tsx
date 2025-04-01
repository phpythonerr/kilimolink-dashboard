"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";

// Define your data type
export interface PurchasesInterface {
  created_date: Date;
  product_id: {
    name: string;
    id: string;
  };
  quantity: number;
  product_uom: string;
  unit_price: number;
  payment_status: string;
}

// Define your columns
export const columns: ColumnDef<PurchasesInterface>[] = [
  {
    accessorKey: "created_date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("created_date")).toDateString();
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
