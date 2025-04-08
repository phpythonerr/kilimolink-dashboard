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
import { isWithinLastThreeDays } from "@/lib/utils";
import { EditSheet } from "./edit-sheet";

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
  created_date: any;
  purchase_date: any;
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
    accessorKey: "seller_type",
    header: "Seller Type",
    cell: ({ row }) => {
      const { seller_type } = row.original;

      return <span className="capitalize">{seller_type || "Unknown"}</span>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const { user_obj: user } = row.original;

      return user?.user_metadata?.location;
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
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const { payment_status } = row.original;
      return `${payment_status}`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [showPaymentDialog, setShowPaymentDialog] = useState(false);
      const [showEditSheet, setShowEditSheet] = useState(false);
      const purchase = row.original;

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
              <DropdownMenuItem>View</DropdownMenuItem>
              {isWithinLastThreeDays(purchase?.purchase_date) && (
                <DropdownMenuItem onClick={() => setShowEditSheet(true)}>
                  Edit
                </DropdownMenuItem>
              )}

              {purchase.payment_status !== "Paid" && (
                <DropdownMenuItem
                  onClick={() => setShowPaymentDialog(true)}
                  disabled={purchase.payment_status === "Paid"}
                >
                  Mark as Paid
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <PaymentDialog
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            purchaseId={purchase.id}
          />

          <EditSheet
            open={showEditSheet}
            onOpenChange={setShowEditSheet}
            purchase={purchase}
          />
        </>
      );
    },
  },
];
