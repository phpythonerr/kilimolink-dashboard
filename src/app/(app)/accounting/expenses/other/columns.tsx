"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Define your data type
export interface ExpenseInterface {
  id: string;
  date: Date;
  amount: number;
  txn_reference_code: string;
  expense_type_id: {
    name: string;
  };
  description: string;
}

// Define your columns
export const columns: ColumnDef<ExpenseInterface>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toDateString();
    },
  },
  {
    accessorKey: "id",
    header: "Expense Type",
    cell: ({ row }) => {
      const expense_type = row.original?.expense_type_id?.name as string;
      const description = row.original?.description as string;
      return (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex items-center gap-2">
              <span> {expense_type}</span>
              <Info size={12} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>{description}</p>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `Ksh.${row.getValue("amount").toLocaleString()}`;
    },
  },
  {
    accessorKey: "txn_reference_code",
    header: "Txn Code",
    cell: ({ row }) => {
      return row.getValue("txn_reference_code");
    },
  },
];
