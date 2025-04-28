"use client";

import * as React from "react"; // Import React
import { MoreHorizontal, Printer, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Not needed if triggered programmatically
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ActionButtonProps {
  orderId: number;
  // Add other props needed for actions, e.g., print handlers
}

export function ActionButton({ orderId }: ActionButtonProps) {
  const [isCreditNoteDialogOpen, setIsCreditNoteDialogOpen] =
    React.useState(false);

  const handlePrintInvoice = () => {
    console.log("Print Invoice for order:", orderId);
    // Add actual print logic here
  };

  const handlePrintDeliveryNote = () => {
    console.log("Print Delivery Note for order:", orderId);
    // Add actual print logic here
  };

  const handleEditOrder = () => {
    console.log("Edit Order:", orderId);
    // Add navigation or modal logic for editing
  };

  // Placeholder submit handler for the dialog form
  const handleCreditNoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submitting credit note/discount...");
    // Add logic to process form data and call server action
    setIsCreditNoteDialogOpen(false); // Close dialog on submit
  };

  return (
    <Dialog
      open={isCreditNoteDialogOpen}
      onOpenChange={setIsCreditNoteDialogOpen}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handlePrintInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrintDeliveryNote}>
            <FileText className="mr-2 h-4 w-4" />
            Print Delivery Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditOrder}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* New Menu Item */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Prevent default closing behavior
              setIsCreditNoteDialogOpen(true); // Open the dialog
            }}
          >
            {/* Consider a more specific icon if available */}
            <FileText className="mr-2 h-4 w-4" />
            Add Credit Note / Discount
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Credit Note / Discount</DialogTitle>
          <DialogDescription>
            Apply a credit note or discount to order #{orderId}. Changes will be
            reflected in the order totals.
          </DialogDescription>
        </DialogHeader>
        {/* Simple form example */}
        <form onSubmit={handleCreditNoteSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              {/* Replace with Select component if needed */}
              <Input
                id="type"
                defaultValue="Credit Note"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (KES)
              </Label>
              <Input
                id="amount"
                type="number"
                defaultValue="0.00"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input id="reason" defaultValue="" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Apply Change</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
