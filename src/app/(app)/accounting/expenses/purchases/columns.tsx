"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import { deletePurchase } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  payment_status: any;
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
      const [showAlertDialog, setShowAlertDialog] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);
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

              {isWithinLastThreeDays(purchase?.purchase_date) && (
                <DropdownMenuItem
                  onClick={() => setShowAlertDialog(true)}
                  className="text-destructive"
                >
                  Delete
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

          <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Purchase Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete
                  this purchase record?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-4">
                <h3 className="font-medium mb-2">Purchase Summary:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Vendor:</div>
                  <div>
                    {`${
                      purchase.user_obj?.user_metadata?.first_name ||
                      purchase.user_obj?.user_metadata?.firstName ||
                      ""
                    } 
                        ${
                          purchase.user_obj?.user_metadata?.last_name ||
                          purchase.user_obj?.user_metadata?.lastName ||
                          ""
                        } ${
                      purchase.user_obj?.user_metadata?.tradeName
                        ? ` (${purchase.user_obj?.user_metadata?.tradeName})`
                        : ``
                    }`}
                  </div>

                  <div className="text-muted-foreground">Product:</div>
                  <div>{purchase.product_id?.name || "Unknown Product"}</div>

                  <div className="text-muted-foreground">Purchase Date:</div>
                  <div>{new Date(purchase.purchase_date).toDateString()}</div>

                  <div className="text-muted-foreground">Quantity:</div>
                  <div>
                    {purchase.quantity} {purchase.product_uom}
                  </div>

                  <div className="text-muted-foreground">Unit Price:</div>
                  <div>
                    Ksh.{purchase.unit_price} / {purchase.product_uom}
                  </div>

                  <div className="text-muted-foreground">Payment Status:</div>
                  <div>{purchase.payment_status}</div>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setIsDeleting(true);
                    const formData = new FormData();
                    formData.append("purchaseId", purchase.id);

                    toast.promise(
                      deletePurchase(formData).finally(() => {
                        setIsDeleting(false);
                        setShowAlertDialog(false);
                      }),
                      {
                        loading: "Deleting purchase record...",
                        success: (data) => {
                          if (data.error) {
                            throw new Error(data.error);
                          }
                          return "Purchase record deleted successfully";
                        },
                        error: (error) => {
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : "Failed to delete the purchase record";
                          return errorMessage;
                        },
                      }
                    );
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
