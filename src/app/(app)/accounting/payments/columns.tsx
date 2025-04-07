"use client";
import {
  MoreHorizontal,
  Download,
  CircleX,
  CircleCheckBig,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ApprovalDialog } from "./approval-dialog";
import { PaymentSummaryDialog } from "./payment-summary-dialog";
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
  approved_by_obj: User;
  approval_datetime: Date;
  status: string;
  current_user: User;
  in_favor_of: User | null; // Allow null for vendors not set
}

// Define your columns
export const columns: ColumnDef<PaymentInterface>[] = [
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.getValue("created")).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      });
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
    accessorKey: "in_favor_of",
    header: "In Favor Of",
    cell: ({ row }) => {
      const { in_favor_of } = row.original;
      let dispayName = null;
      if (in_favor_of) {
        const firstName =
          in_favor_of?.user_metadata?.first_name ||
          in_favor_of?.user_metadata?.firstName ||
          "Unknown";
        const lastName =
          in_favor_of?.user_metadata?.last_name ||
          in_favor_of?.user_metadata?.lastName ||
          "Vendor";

        dispayName = `${firstName} ${lastName}`;
      }

      return dispayName ? (
        <Link
          href={`/users/vendors/view?id=${in_favor_of?.id}`}
          className="text-primary hover:underline"
          title={dispayName}
        >
          {dispayName}
        </Link>
      ) : (
        "Unknown Vendor"
      );
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

  // {
  //   accessorKey: "payment_method",
  //   header: "Payment Method",
  //   cell: ({ row }) => {
  //     const { payment_method } = row.original;
  //     return payment_method ? (
  //       <span className={`capitalize`}>{payment_method}</span>
  //     ) : (
  //       "-"
  //     );
  //   },
  // },
  // {
  //   accessorKey: "txn_reference_code",
  //   header: "Txn Code",
  //   cell: ({ row }) => {
  //     const { txn_reference_code } = row.original;
  //     return txn_reference_code ? (
  //       <span className={`capitalize`}>{txn_reference_code}</span>
  //     ) : (
  //       "-"
  //     );
  //   },
  // },
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
    accessorKey: "approval_datetime",
    header: "Approved at",
    cell: ({ row }) => {
      const { approval_datetime } = row.original;
      return approval_datetime
        ? new Date(approval_datetime).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "medium",
          })
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
          className={`capitalize font-medium ${
            status === "Approved"
              ? "text-primary"
              : status === "Pending"
              ? "text-blue-800 dark:text-blue-400"
              : "text-red-800 dark:text-red-400"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [showApprovalDialog, setShowApprovalDialog] = useState(false);
      const [showSummaryDialog, setShowSummaryDialog] = useState(false);
      const [approvalAction, setApprovalAction] = useState<"approv" | "reject">(
        "approv"
      );
      const payment = row.original;
      const currentUser = row.original.current_user;

      // For both processed and unprocessed payments
      const commonDropdownItems = (
        <DropdownMenuItem
          onClick={() => setShowSummaryDialog(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Payment Summary
        </DropdownMenuItem>
      );

      // For processed payments
      if (
        payment.initiated_by_obj?.id === currentUser?.id ||
        payment.status === "Approved" ||
        payment.status === "Rejected"
      ) {
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {commonDropdownItems}
              </DropdownMenuContent>
            </DropdownMenu>

            <PaymentSummaryDialog
              open={showSummaryDialog}
              onOpenChange={setShowSummaryDialog}
              paymentId={payment.id}
            />
          </>
        );
      }

      // For unprocessed payments
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {commonDropdownItems}
              <DropdownMenuItem
                onClick={() => {
                  setApprovalAction("approv");
                  setShowApprovalDialog(true);
                }}
                className="text-primary flex items-center gap-2"
              >
                <CircleCheckBig className="w-4 h-4 text-primary" />
                Approve Payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setApprovalAction("reject");
                  setShowApprovalDialog(true);
                }}
                className="text-destructive flex items-center gap-2"
              >
                <CircleX className="w-4 h-4 text-destructive" />
                Reject Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ApprovalDialog
            open={showApprovalDialog}
            onOpenChange={setShowApprovalDialog}
            paymentId={payment.id}
            action={approvalAction}
          />

          <PaymentSummaryDialog
            open={showSummaryDialog}
            onOpenChange={setShowSummaryDialog}
            paymentId={payment.id}
          />
        </>
      );
    },
  },
];
