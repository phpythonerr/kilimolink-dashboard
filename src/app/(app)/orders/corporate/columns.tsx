"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define your data type
interface UserMetadata {
  business_name?: string;
}

interface UserObject {
  name?: string;
  user_metadata: UserMetadata;
}

export interface Order {
  id: string;
  order_number: string;
  user: string;
  user_obj: UserObject;
  branch?: string;
  total: number;
  status: "pending" | "processing" | "in-transit" | "completed" | "cancelled";
  created: string;
  delivery_date: string;
}

// Define your columns
export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_number",
    header: "Order #",
    cell: ({ row }) => {
      const order_number = row.getValue("order_number") as string;
      const order_id = row.original.id as string;
      return (
        <Link
          href={`/orders/corporate/view?id=${order_id}`}
          className="text-primary"
        >{`#${order_number}`}</Link>
      );
    },
  },

  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => {
      const branch = row.original.branch as string;
      const business_name =
        row?.original?.user_obj?.user_metadata?.business_name ||
        row?.original?.user_obj?.name;

      return (
        <Link
          href={`/users/customers/corporate/view?id=${row.getValue("user")}`}
          className="flex flex-col"
        >
          <span className="text-primary">{business_name}</span>
          {branch && <span className="text-xs">({branch})</span>}
        </Link>
      );
    },
  },

  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => {
      return `Ksh.${Number(row.getValue("total")).toLocaleString()}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return `${row.getValue("status")}`;
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      return `${row.getValue("payment_status")}`;
    },
  },
  {
    accessorKey: "created",
    header: "Order Date",
    cell: ({ row }) => {
      return new Date(row.getValue("created")).toDateString();
    },
  },
  {
    accessorKey: "delivery_date",
    header: "Delivery Date",
    cell: ({ row }) => {
      return new Date(row.getValue("delivery_date")).toDateString();
    },
  },
];
