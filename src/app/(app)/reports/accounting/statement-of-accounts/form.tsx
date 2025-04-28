"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import Image from "next/image";
import { CalendarIcon, Check, ChevronsUpDown, Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer"; // Import PDFDownloadLink
import { useTheme } from "next-themes"; // Import useTheme

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateStatement, StatementData } from "./actions"; // Import the action and updated type
import { Separator } from "@/components/ui/separator"; // Assuming you have Separator component
import StatementPDF from "./soa-pdf"; // Import the PDF component
// Removed Card imports as they are no longer used here

// Define the form schema - changed to single customerId
const FormSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
  customerId: z.string({ required_error: "Please select a customer." }), // Changed from customerIds array
});

type Customer = {
  id: string;
  name: string | null; // Allow null if name can be null in db
};

interface StatementFormProps {
  customers: Customer[];
}

export default function StatementForm({ customers }: StatementFormProps) {
  const [statementData, setStatementData] = React.useState<
    StatementData[] | null
  >(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = React.useState(false);
  const { theme } = useTheme(); // Get the current theme

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      customerId: undefined, // Initialize as undefined
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    setStatementData(null);
    try {
      const result = await generateStatement({
        startDate: data.dateRange.from,
        endDate: data.dateRange.to,
        customerId: data.customerId,
      });
      setStatementData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate statement."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to format currency (KES) - conditionally includes symbol
  const formatCurrency = (
    value: number | null | undefined,
    includeSymbol: boolean = false // Default to not including the symbol
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "KES", // Set currency to KES
      currencyDisplay: "narrowSymbol", // Use symbol like Ksh if available, otherwise code
    };
    if (!includeSymbol) {
      // If not including symbol, format as decimal number
      options.style = "decimal";
      // Ensure minimum fraction digits for consistency, remove currency options
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
      delete options.currency;
      delete options.currencyDisplay;
      return new Intl.NumberFormat("en-KE", options).format(value); // Use locale for KES formatting rules
    }
    // Format with currency symbol for totals
    return new Intl.NumberFormat("en-KE", options).format(value);
  };

  // Helper function to calculate totals and check for optional columns/status
  const getStatementInfo = (invoices: StatementData["invoices"]) => {
    let totalAmount = 0;
    let totalPaid = 0; // This will now sum totals of 'Paid' invoices
    let totalOwed = 0;
    let hasDiscount = false;
    let hasBranch = false;
    let isAnyUnpaid = false;

    invoices.forEach((invoice) => {
      const invoiceTotal = invoice.total ?? 0;
      totalAmount += invoiceTotal;
      // totalPaid += invoice.amountPaid; // OLD LOGIC
      totalOwed += invoice.amountOwed;

      // NEW LOGIC: Sum totals only if status is 'Paid'
      if (invoice.paymentStatus === "Paid") {
        totalPaid += invoiceTotal;
      }

      if (invoice.discount && invoice.discount > 0) {
        hasDiscount = true;
      }
      if (invoice.branch) {
        hasBranch = true;
      }
      if (invoice.amountOwed > 0) {
        isAnyUnpaid = true;
      }
    });

    return {
      totalAmount,
      totalPaid, // Now represents sum of totals for 'Paid' invoices
      totalOwed,
      hasDiscount,
      hasBranch,
      isAnyUnpaid,
    };
  };

  // Get selected customer name for the preview header
  const selectedCustomerName = React.useMemo(() => {
    const customerId = form.watch("customerId"); // Watch the customerId field
    if (!customerId) return "Customer";
    return customers.find((c) => c.id === customerId)?.name ?? "Customer";
  }, [form, customers]);

  // Watch the dateRange field specifically
  const dateRangeValue = form.watch("dateRange");

  // Get selected date range for the preview header and PDF
  const selectedDateRange = React.useMemo(() => {
    const range = dateRangeValue; // Use the watched value
    if (!range?.from || !range?.to) return "Selected Period"; // Provide default text
    // Format dates using LLL dd, y (e.g., Jan 01, 2024)
    return `${format(range.from, "LLL dd, y")} - ${format(
      range.to,
      "LLL dd, y"
    )}`;
    // Depend specifically on the watched date range value
  }, [dateRangeValue]);

  // Generate filename for PDF
  const pdfFileName = React.useMemo(() => {
    if (!statementData || statementData.length === 0) return "statement.pdf";
    const customerName =
      statementData[0].customerName?.replace(/\s+/g, "_") ?? "customer";
    const datePart = format(new Date(), "yyyyMMdd");
    return `Statement_${customerName}_${datePart}.pdf`;
  }, [statementData]);

  return (
    <>
      {/* Form and Controls Row */}
      {/* Simplified the top section to just the form */}
      <div className="mb-8">
        {/* Form Section */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-wrap items-end gap-4" // Use flex for inline inputs
          >
            {/* Date Range Picker */}
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{
                          from: field.value?.from!,
                          to: field.value?.to!,
                        }}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Single-Select Combobox */}
            <FormField
              control={form.control}
              name="customerId" // Changed name
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Customer</FormLabel> {/* Changed label */}
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className={cn(
                            "w-[300px] justify-between",
                            !field.value && "text-muted-foreground" // Style placeholder
                          )}
                        >
                          {field.value // Find and display selected customer name
                            ? customers.find(
                                (customer) => customer.id === field.value
                              )?.name ?? "Select customer..."
                            : "Select customer..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search customer..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers.map((customer: any) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.name ?? customer.id} // Use name for search/display
                                onSelect={(currentValue) => {
                                  // Find customer by name (or value used in CommandItem)
                                  const selectedCustomer = customers.find(
                                    (c) =>
                                      (c.name ?? c.id).toLowerCase() ===
                                      currentValue.toLowerCase()
                                  );
                                  // Set the customer ID in the form
                                  form.setValue(
                                    "customerId",
                                    selectedCustomer ? selectedCustomer.id : ""
                                  );
                                  // Close the combobox on selection
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === customer.id // Check if current customer is selected
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {customer.name ?? `ID: ${customer.id}`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons Row */}
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isLoading} className="self-end">
                {isLoading ? "Generating..." : "Generate Statement"}
              </Button>

              {/* Wrap Download Button with PDFDownloadLink */}
              {statementData && statementData.length > 0 && !isLoading ? (
                <PDFDownloadLink
                  document={
                    <StatementPDF
                      statement={statementData[0]} // Pass the first statement object
                      dateRange={selectedDateRange}
                    />
                  }
                  fileName={pdfFileName}
                >
                  {({ loading }) => (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      className="self-end"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {loading ? "Preparing PDF..." : "Download Statement"}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                // Show disabled button if no data or loading
                <Button
                  type="button"
                  variant="outline"
                  disabled={true}
                  className="self-end"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Statement
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Removed Controls Section Card */}
      </div>

      {/* Full Width Display Area */}
      <div className="mt-8">
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
        {isLoading && <p>Loading statement...</p>}

        {statementData && statementData.length > 0 && (
          // Added dark mode classes to the main container
          <div className="rounded-lg border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-900">
            {statementData.map((statement: any) => {
              const {
                totalAmount,
                totalPaid,
                totalOwed,
                hasDiscount,
                hasBranch,
                isAnyUnpaid,
              } = getStatementInfo(statement.invoices);

              let footerColSpan = 3;
              if (hasBranch) footerColSpan++;
              if (hasDiscount) footerColSpan++;

              return (
                // Added dark mode text color
                <div key={statement.customerId} className="dark:text-gray-200">
                  {/* Statement Header */}
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <Image
                        // Conditionally set the src based on the theme
                        src={
                          theme === "dark"
                            ? "/img/logo/logo-white-primary.svg" // Dark mode logo
                            : "/img/logo/logo-primary-by-lolkirr.png" // Light mode logo
                        }
                        alt="Kilimolink" // Added alt text
                        width={200} // Set width prop (rounded)
                        height={50} // Set height prop
                        className="mb-3" // Use Tailwind for margin if needed
                      />
                      {/* Added dark mode classes */}
                    </div>
                    <div className="text-right">
                      {/* Updated theme color */}
                      <h2 className="mb-1 text-2xl font-semibold uppercase text-green-600 dark:text-green-400">
                        Statement of Account
                      </h2>
                      {/* Added dark mode classes */}
                      <p className="text-sm dark:text-gray-300">
                        {selectedDateRange}
                      </p>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="mb-6">
                    <p className="font-semibold">Bill To:</p>
                    {/* Added dark mode classes */}
                    <p className="text-sm dark:text-gray-300">
                      {statement.customerName}
                    </p>
                    {/* Add KRA PIN if available */}
                    {statement.kraPinNumber && (
                      <p className="text-sm dark:text-gray-300">
                        PIN: {statement.kraPinNumber}
                      </p>
                    )}
                    {/* Add more customer address details if available */}
                  </div>

                  {/* Added dark mode classes */}
                  <Separator className="my-4 dark:bg-gray-600" />

                  {/* Invoices Table */}
                  {statement.invoices.length === 0 ? (
                    // Added dark mode classes
                    <p className="py-4 text-center text-muted-foreground dark:text-gray-500">
                      No invoices found for this period.
                    </p>
                  ) : (
                    <table className="w-full table-auto border-collapse text-sm">
                      <thead>
                        {/* Updated theme color for border */}
                        <tr className="border-b bg-muted/50 dark:border-gray-700 dark:bg-gray-800/50">
                          {hasBranch && (
                            // Added dark mode classes
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground dark:text-gray-400">
                              Affiliate
                            </th>
                          )}
                          {/* Added dark mode classes to other th elements */}
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground dark:text-gray-400">
                            Invoice #
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground dark:text-gray-400">
                            Invoice Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground dark:text-gray-400">
                            PO Number
                          </th>
                          {hasDiscount && (
                            <th className="px-3 py-2 text-right font-medium text-muted-foreground dark:text-gray-400">
                              Discount (%)
                            </th>
                          )}
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground dark:text-gray-400">
                            Total
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground dark:text-gray-400">
                            Paid
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-muted-foreground dark:text-gray-400">
                            Unpaid
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground dark:text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {statement.invoices.map((invoice: any, index: any) => (
                          // Added dark mode classes for rows and zebra striping
                          <tr
                            key={invoice.invoiceId}
                            className={cn(
                              "border-b dark:border-gray-700",
                              index % 2 !== 0 &&
                                "bg-muted/20 dark:bg-gray-800/30" // Darker zebra stripe
                            )}
                          >
                            {/* ... table cells ... */}
                            {/* Example for one cell, apply similar dark:text-gray-300 to others */}
                            {hasBranch && (
                              <td className="px-3 py-2 dark:text-gray-300">
                                {invoice.branch || "-"}
                              </td>
                            )}
                            <td className="px-3 py-2 dark:text-gray-300">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-3 py-2 dark:text-gray-300">
                              {invoice.invoiceDate
                                ? format(
                                    new Date(invoice.invoiceDate),
                                    "LLL dd, y"
                                  )
                                : "-"}
                            </td>
                            <td className="px-3 py-2 dark:text-gray-300">
                              {invoice.poNumber || "-"}
                            </td>
                            {hasDiscount && (
                              <td className="px-3 py-2 text-right dark:text-gray-300">
                                {invoice.discount?.toFixed(2) ?? "N/A"}
                              </td>
                            )}
                            <td className="px-3 py-2 text-right dark:text-gray-300">
                              {formatCurrency(invoice.total, false)}
                            </td>
                            <td className="px-3 py-2 text-right dark:text-gray-300">
                              {/* Conditionally display total if status is Paid */}
                              {formatCurrency(
                                invoice.paymentStatus === "Paid"
                                  ? invoice.total // Show total if Paid
                                  : invoice.amountPaid, // Otherwise show actual amount paid
                                false
                              )}
                            </td>
                            <td className="px-3 py-2 text-right dark:text-gray-300">
                              {formatCurrency(invoice.amountOwed, false)}
                            </td>
                            <td className="px-3 py-2 dark:text-gray-300">
                              {invoice.paymentStatus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {/* Updated theme color for border */}
                        <tr className="border-t-2 border-green-500 font-semibold dark:border-green-400">
                          <td
                            colSpan={footerColSpan}
                            className="px-3 py-2 text-right"
                          >
                            Totals:
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(totalAmount, true)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {/* Display the newly calculated totalPaid */}
                            {formatCurrency(totalPaid, true)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(totalOwed, true)}
                          </td>
                          <td className="px-3 py-2">
                            {isAnyUnpaid ? "Due" : ""}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* Added dark mode classes */}
                  <Separator className="my-4 dark:bg-gray-600" />

                  {/* Footer with Payment Details (Ensure it's inside the map) */}
                  {statement.customerBank && (
                    // Updated classes for font size and color
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {/* Made heading bolder and slightly larger */}
                      <p className="mb-1 font-semibold text-base text-gray-800 dark:text-gray-100">
                        Payment Details:
                      </p>
                      {statement.customerBank.accName && (
                        <p>Account Name: {statement.customerBank.accName}</p>
                      )}
                      {statement.customerBank.accNumber && (
                        <p>Account No: {statement.customerBank.accNumber}</p>
                      )}
                      {statement.customerBank.bankName && (
                        <p>Bank: {statement.customerBank.bankName}</p>
                      )}
                      {statement.customerBank.bankBranch && (
                        <p>Branch: {statement.customerBank.bankBranch}</p>
                      )}
                      {statement.customerBank.swiftCode && (
                        <p>SWIFT: {statement.customerBank.swiftCode}</p>
                      )}
                      {statement.customerBank.mpesaBusinessNumber && (
                        <p>
                          M-Pesa Paybill:{" "}
                          {statement.customerBank.mpesaBusinessNumber}
                        </p>
                      )}
                      {statement.customerBank.mpesaAccNumber && (
                        <p>
                          M-Pesa Account:{" "}
                          {statement.customerBank.mpesaAccNumber}
                        </p>
                      )}
                    </div>
                  )}
                  {/* Added dark mode classes */}
                  <p className="mt-4 text-center text-xs text-muted-foreground dark:text-gray-500">
                    Thank you for your business!
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {statementData && statementData.length === 0 && (
          // Added dark mode classes
          <p className="text-center text-muted-foreground dark:text-gray-500">
            No statement data found for the selected criteria.
          </p>
        )}
      </div>
    </>
  );
}
