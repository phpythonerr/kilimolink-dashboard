"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// Define your data type
export interface User {
  order_number: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  created_at: string;
}

// Define your columns
export const columns: ColumnDef<User>[] = [
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
