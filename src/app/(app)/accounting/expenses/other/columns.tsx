"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info, MoreHorizontal } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      return description ? (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex items-center gap-2">
              <span> {expense_type}</span>
              <Info size={12} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex">{description}</div>
          </HoverCardContent>
        </HoverCard>
      ) : (
        expense_type
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `Ksh.${Number(row.getValue("amount")).toLocaleString()}`;
    },
  },
  {
    accessorKey: "txn_reference_code",
    header: "Txn Code",
    cell: ({ row }) => {
      return row.getValue("txn_reference_code");
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const id = row.original.id;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuItem asChild>
  //             <Link href={`/accounting/expenses/other/edit?id=${id}`}>
  //               Edit
  //             </Link>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem>Delete</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
