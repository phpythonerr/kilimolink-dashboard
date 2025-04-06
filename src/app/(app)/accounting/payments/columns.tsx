"use client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

interface User {
  id: string;
  user_metadata: {
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    tradeName?: string;
  };
}

// Update User interface with all required properties
export interface PaymentInterface {
  id: string;
  amount: number;
  initiated_by_obj: User;
  created_at: string;
  payment_method: string;
  txn_reference_code: string;
  approved_by: User;
  approval_date: Date;
  status: string;
}

// Define your columns
export const columns: ColumnDef<PaymentInterface>[] = [
  {
    accessorKey: "created",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.getValue("created")).toDateString();
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { amount } = row.original;
      return `Ksh.${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "initiated_by",
    header: "Initiated By",
    cell: ({ row }) => {
      const firstName =
        row.original?.initiated_by_obj?.user_metadata?.first_name ||
        row.original?.initiated_by_obj?.user_metadata?.firstName;
      const lastName =
        row.original?.initiated_by_obj?.user_metadata?.last_name ||
        row.original?.initiated_by_obj?.user_metadata?.lastName;

      const dispayName = `${firstName} ${lastName}`;

      return dispayName;
    },
  },

  {
    accessorKey: "payment_method",
    header: "Payment Method",
    cell: ({ row }) => {
      const { payment_method } = row.original;
      return payment_method ? (
        <span className={`capitalize`}>{payment_method}</span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "txn_reference_code",
    header: "Txn Code",
    cell: ({ row }) => {
      const { txn_reference_code } = row.original;
      return txn_reference_code ? (
        <span className={`capitalize`}>{txn_reference_code}</span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "approved_by",
    header: "Approved By",
    cell: ({ row }) => {
      const firstName =
        row.original?.approved_by_obj?.user_metadata?.first_name ||
        row.original?.approved_by_obj?.user_metadata?.firstName;
      const lastName =
        row.original?.approved_by_obj?.user_metadata?.last_name ||
        row.original?.approved_by_obj?.user_metadata?.lastName;

      const dispayName =
        firstName && lastName ? `${firstName} ${lastName}` : "-";

      return dispayName;
    },
  },
  {
    accessorKey: "approval_date",
    header: "Approved at",
    cell: ({ row }) => {
      const { approval_date } = row.original;
      return approval_date
        ? new Date(row.getValue("approval_date")).toDateString()
        : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <span
          className={`capitalize ${
            status === "Approved"
              ? "text-primary"
              : "text-red-800 dark:text-red-400"
          }`}
        >
          {status}
        </span>
      );
    },
  },
];
