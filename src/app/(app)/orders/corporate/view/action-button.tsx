"use client";

import { useState } from "react";
import { useForm } from "react-hook-form"; // Import useForm
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver
import { z } from "zod"; // Import z
import {
  EllipsisVertical,
  ListCheck,
  CreditCard,
  Download,
  Trash2,
  Ellipsis,
  FileText, // Added for new option
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import Invoice from "./invoice-pdf";
import DeliveryNote from "./delivery-note-pdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components
// Remove Label import if not used elsewhere
// import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Import Input

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  // DropdownMenuLabel, // Not used
  // DropdownMenuPortal, // Not used
  DropdownMenuSeparator,
  // DropdownMenuShortcut, // Not used
  // DropdownMenuSub, // Not used
  // DropdownMenuSubContent, // Not used
  // DropdownMenuSubTrigger, // Not used
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Import Form components

// Define the schema outside the component
const createCreditNoteSchema = (orderTotal: number) =>
  z
    .object({
      type: z.enum(["Percentage", "Amount"], {
        required_error: "Please select a type.",
      }),
      amount: z.coerce // Use coerce to ensure string input becomes number
        .number({
          required_error: "Amount is required.",
          invalid_type_error: "Amount must be a number.",
        })
        .positive({ message: "Amount must be positive." }),
      reason: z
        .string({ required_error: "Reason is required." })
        .min(3, { message: "Reason must be at least 3 characters." }),
    })
    .refine(
      (data) => {
        if (data.type === "Percentage") {
          return data.amount >= 0 && data.amount <= 100;
        }
        return true; // No upper limit check needed here for Percentage (besides <=100)
      },
      {
        message: "Percentage must be between 0 and 100.",
        path: ["amount"], // Apply error to amount field
      }
    )
    .refine(
      (data) => {
        if (data.type === "Amount") {
          // Ensure amount is not more than the order total
          return data.amount <= orderTotal;
        }
        return true; // No check needed for Percentage type here
      },
      {
        message: `Amount cannot exceed the order total of ${orderTotal.toFixed(
          2
        )}.`,
        path: ["amount"], // Apply error to amount field
      }
    );

// Define props type
interface ActionButtonProps {
  id: number;
  order_number: string;
  customer: any; // Use more specific types if available
  items: any[]; // Use more specific types if available
  revenue: any[]; // Use more specific types if available
  bankAccount: any; // Use more specific types if available
  orderTotal: number; // Add orderTotal prop
}

export function ActionButton({
  id,
  order_number,
  customer,
  items,
  revenue,
  bankAccount,
  orderTotal, // Destructure orderTotal
}: ActionButtonProps) {
  const [isCreditNoteDialogOpen, setIsCreditNoteDialogOpen] = useState(false);

  // Dynamically create schema based on orderTotal
  const formSchema = createCreditNoteSchema(orderTotal);

  // Setup react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined, // Or "Amount" / "Percentage" if you want a default
      amount: 0,
      reason: "",
    },
  });

  // Updated submit handler using react-hook-form data
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting credit note/discount:", values);
    // Add logic to process form data and call server action
    // Example: await addCreditNoteAction({ orderId: id, ...values });
    toast.success("Feature currently unavailable. Please check back later");
    setIsCreditNoteDialogOpen(false); // Close dialog on submit
    form.reset(); // Reset form fields
  }

  // Function to close dialog and reset form
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset(); // Reset form when dialog is closed
    }
    setIsCreditNoteDialogOpen(open);
  };

  return (
    <Dialog open={isCreditNoteDialogOpen} onOpenChange={handleDialogClose}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Ellipsis />
            {/* <span>Actions</span> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem key="delivery-note">
              <PDFDownloadLink
                document={
                  <DeliveryNote
                    id={id}
                    order_number={order_number}
                    customer={customer}
                    items={items}
                  />
                }
                fileName={`Kilimolink-DN#${order_number}.pdf`}
                className="w-full flex items-center"
              >
                {({ loading }) => {
                  return (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      <span>
                        {loading
                          ? "Preparing Delivery Note..."
                          : "Download Delivery Note"}
                      </span>
                    </>
                  );
                }}
              </PDFDownloadLink>
            </DropdownMenuItem>
            <DropdownMenuItem key="invoice">
              <PDFDownloadLink
                document={
                  <Invoice
                    id={id}
                    order_number={order_number}
                    customer={customer}
                    items={items}
                    revenue={revenue}
                    bankAccount={bankAccount}
                  />
                }
                fileName={`Kilimolink-Inv#${order_number}.pdf`}
                className="w-full flex items-center"
              >
                {({ loading }) => {
                  return (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      <span>
                        {loading ? "Preparing Invoice..." : "Download Invoice"}
                      </span>
                    </>
                  );
                }}
              </PDFDownloadLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            key="credit-note"
            onSelect={(e) => {
              e.preventDefault();
              setIsCreditNoteDialogOpen(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span>Add Credit Note</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Credit Note</DialogTitle>
          <DialogDescription>
            Apply a credit note to order #{order_number}. Max Amount: KES{" "}
            {orderTotal.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        {/* Form using react-hook-form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    required // Added required
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Amount">Amount</SelectItem>
                      <SelectItem value="Percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount{" "}
                    {form.watch("type") === "Percentage" ? "(%)" : "(KES)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={
                        form.watch("type") === "Percentage" ? "0.1" : "0.01"
                      }
                      placeholder={
                        form.watch("type") === "Percentage"
                          ? "e.g., 10"
                          : "e.g., 500.00"
                      }
                      {...field}
                      required // Added required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Goodwill gesture"
                      {...field}
                      required // Added required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Applying..." : "Apply Change"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
