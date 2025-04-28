import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font, // Keep Font import
} from "@react-pdf/renderer";
import { StatementData } from "./actions"; // Keep type import
import { format } from "date-fns"; // Import format if not already (needed for table later)

// --- Font Registration ---
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // Or your actual base URL

Font.register({
  family: "Geist Sans",
  fonts: [
    {
      src: `${baseUrl}/fonts/Geist/static/Geist-Regular.ttf`, // Verify actual filename
      fontWeight: "normal",
    },
    {
      src: `${baseUrl}/fonts/Geist/static/Geist-Bold.ttf`, // Verify actual filename
      fontWeight: "bold",
    },
    // Add other weights (e.g., 'semibold', 'medium') if needed and available
  ],
});
// --- End Font Registration ---

// --- Helper Functions ---

// Helper function to format currency (KES) - PDF version
const formatCurrencyPDF = (
  value: number | null | undefined,
  includeSymbol: boolean = false // Keep this parameter, but we'll mostly use false now
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  const options: Intl.NumberFormatOptions = {
    style: "decimal", // Always use decimal for PDF to control spacing
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  const formattedValue = new Intl.NumberFormat("en-KE", options).format(value);
  // Only prepend symbol if explicitly asked, which we won't for the footer totals
  return includeSymbol ? `KES ${formattedValue}` : formattedValue;
};

// Helper function to calculate totals and check for optional columns/status - PDF version
const getStatementInfoPDF = (invoices: StatementData["invoices"]) => {
  let totalPreDiscount = 0;
  let totalDiscountAmount = 0;
  let totalPaidDisplay = 0; // Total for the 'Paid' column display logic
  let totalOwed = 0;
  let hasDiscount = false;
  let hasBranch = false;
  let hasPO = false; // Added check for PO Number
  let isAnyUnpaid = false;

  invoices.forEach((invoice) => {
    const invoicePreDiscountTotal = invoice.total ?? 0;
    const discountAmount = invoice.discount?.amount ?? 0;
    const discountedTotal = invoicePreDiscountTotal - discountAmount;

    totalPreDiscount += invoicePreDiscountTotal;
    totalOwed += invoice.amountOwed;

    // Calculate value for 'Paid' column display
    let paidColumnValue = 0;
    if (invoice.paymentStatus === "Paid") {
      paidColumnValue = discountedTotal; // Show discounted total if paid
    } else {
      paidColumnValue = invoice.amountPaid; // Show actual amount paid otherwise
    }
    totalPaidDisplay += paidColumnValue; // Sum the displayed paid values

    if (invoice.discount && invoice.discount.amount > 0) {
      hasDiscount = true;
      totalDiscountAmount += invoice.discount.amount;
    }
    if (invoice.branch) {
      hasBranch = true;
    }
    if (invoice.poNumber) {
      // Check if PO number exists
      hasPO = true;
    }
    if (invoice.amountOwed > 0) {
      isAnyUnpaid = true;
    }
  });

  return {
    totalPreDiscount,
    totalDiscountAmount,
    totalPaidDisplay, // Use this for the footer 'Paid' total
    totalOwed,
    hasDiscount,
    hasBranch,
    hasPO, // Return hasPO
    isAnyUnpaid,
  };
};

// --- End Helper Functions ---

// Add styles for header, logo, etc.
const styles = StyleSheet.create({
  page: {
    fontFamily: "Geist Sans", // Use the registered font family
    fontWeight: "normal", // Explicitly set default weight
    fontSize: 9, // Adjusted default font size
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 50, // Add more bottom padding for page number
    color: "#333",
    position: "relative", // Needed for absolute positioning of children
  },
  // Header Section
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    // Container for logo and company details
  },
  logo: {
    width: 89,
    height: 30,
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: "#666",
    lineHeight: 2,
  },
  headerRight: {
    // Removed textAlign: "right"
    alignItems: "flex-end", // Align children (Text) to the right
  },
  statementTitle: {
    fontSize: 12,
    fontFamily: "Geist Sans", // Ensure consistent font
    fontWeight: "bold", // Use string for fontWeight
    color: "#2E7D32", // Green color
    textTransform: "uppercase",
    marginBottom: 2,
    // Removed textAlign: "right"
  },
  dateRange: {
    fontSize: 9,
    fontFamily: "Geist Sans", // Ensure consistent font
    color: "#555",
    // Removed textAlign: "right"
  },
  // Bill To Section
  billTo: {
    marginBottom: 20,
    marginTop: 10, // Add some space after header
  },
  billToLabel: {
    fontFamily: "Geist Sans", // Ensure consistent font
    fontWeight: "bold", // Use string for fontWeight
    fontSize: 10,
    marginBottom: 2,
  },
  // Separator
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  // Keep text style if needed elsewhere, or remove if only used in header/billto
  text: {
    fontSize: 9, // Match default page size
    fontFamily: "Geist Sans", // Ensure consistent font
  },
  // Payment Details Section
  paymentDetails: {
    marginTop: 20, // Space after table placeholder/separator
    fontSize: 8,
    color: "#555",
    lineHeight: 2,
  },
  paymentDetailsLabel: {
    fontFamily: "Geist Sans", // Ensure consistent font
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 9,
    color: "#333",
  },
  // Page Number
  pageNumber: {
    fontFamily: "Geist Sans", // Ensure consistent font
    position: "absolute",
    fontSize: 8,
    bottom: 30,
    left: 0,
    right: 40, // Match right padding
    textAlign: "right",
    color: "grey",
  },
  // --- Table Styles ---
  table: {
    width: "100%",
    marginTop: 10, // Add space after separator
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 18, // Adjusted min height for smaller font
  },
  tableHeader: {
    backgroundColor: "#f8f8f8",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  tableColHeader: {
    paddingVertical: 3, // Reduced padding
    paddingHorizontal: 4, // Reduced padding
    fontWeight: "bold",
    fontSize: 7, // Reduced font size
    color: "#555",
    fontFamily: "Geist Sans", // Apply font to table header
  },
  tableCol: {
    paddingVertical: 2, // Reduced padding
    paddingHorizontal: 4, // Reduced padding
    fontSize: 7, // Reduced font size
    fontFamily: "Geist Sans", // Apply font to table cells
  },
  // --- Base Column Widths (when all columns are shown) ---
  colBranchBase: { width: "9%" },
  colInvoiceNumBase: { width: "11%" },
  colDateBase: { width: "11%" },
  colPOBase: { width: "11%" },
  // Adjusted discount width slightly, might need more depending on format
  colDiscountBase: { width: "10%", textAlign: "right" },
  colTotalBase: { width: "14%", textAlign: "right" }, // Pre-discount total
  colPaidBase: { width: "12%", textAlign: "right" }, // Amount paid
  colUnpaidBase: { width: "12%", textAlign: "right" }, // Amount owed (after discount)
  colStatusBase: { width: "10%" }, // Status
  // --- Width Adjustments (when columns are hidden) ---
  // Define adjustments or alternative full sets of widths if needed
  // Example: Increase other columns slightly if branch is hidden
  colInvoiceNumNoBranch: { width: "12%" },
  colDateNoBranch: { width: "12%" },
  colPONoBranch: { width: "12%" },
  // Example: Increase other columns slightly if discount is hidden
  colTotalNoDiscount: { width: "16%", textAlign: "right" },
  colPaidNoDiscount: { width: "16%", textAlign: "right" },
  colUnpaidNoDiscount: { width: "16%", textAlign: "right" },
  colStatusNoDiscount: { width: "12%" },
  // --- End Column Widths ---

  tableFooter: {
    flexDirection: "row",
    borderTopColor: "#2E7D32",
    borderTopWidth: 1.5,
    marginTop: 5,
    paddingTop: 5,
    fontWeight: "bold",
    alignItems: "center", // Align items vertically in the footer row
  },
  footerTotalsLabel: {
    // Width will be set dynamically
    paddingVertical: 2, // Match tableCol padding
    paddingHorizontal: 4,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 7, // Match reduced font size
    fontFamily: "Geist Sans", // Apply font to footer
    paddingRight: 8, // Add a bit more space after the label
  },
  footerTotalValue: {
    // Base style, width added dynamically
    paddingVertical: 2, // Match tableCol padding
    paddingHorizontal: 4,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 7, // Match reduced font size
    fontFamily: "Geist Sans", // Apply font to footer
  },
  footerStatus: {
    // Base style, width added dynamically
    paddingVertical: 2, // Match tableCol padding
    paddingHorizontal: 4,
    fontWeight: "bold",
    fontSize: 7, // Match reduced font size
    fontFamily: "Geist Sans", // Apply font to footer
  },
  // --- End Table Styles ---

  // Watermark Style (Updated for Image)
  watermark: {
    position: "absolute",
    top: "35%", // Adjust vertical position
    left: "30%", // Adjust horizontal position
    width: 300, // Set desired width for the watermark image
    height: 300, // Set desired height (or let it scale based on width)
    opacity: 0.08, // Adjust opacity
    zIndex: -1, // Ensure it's behind other content
    // Removed text-specific styles (fontSize, color, transform, fontFamily, fontWeight)
  },
});

interface StatementPDFProps {
  statement: StatementData; // Expecting a single statement object
  dateRange: string;
}

const StatementPDF: React.FC<StatementPDFProps> = ({
  statement,
  dateRange,
}) => {
  // Basic check if statement data exists
  if (!statement) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Error: Statement data is missing.</Text>
        </Page>
      </Document>
    );
  }

  // Calculate totals using the updated helper
  const {
    totalPreDiscount, // Use updated name
    totalDiscountAmount,
    totalPaidDisplay, // Get the calculated total for display
    totalOwed,
    hasDiscount,
    hasBranch,
    hasPO, // Get hasPO
    isAnyUnpaid,
  } = getStatementInfoPDF(statement.invoices);

  // --- Dynamic Width Calculation ---
  const colWidths = {
    branch: hasBranch ? styles.colBranchBase : {}, // Empty object if hidden
    invoiceNum: hasBranch
      ? styles.colInvoiceNumBase
      : styles.colInvoiceNumNoBranch,
    date: hasBranch ? styles.colDateBase : styles.colDateNoBranch,
    po: hasPO ? styles.colPOBase : {}, // Use PO width if hasPO, else empty
    // New Order
    total: hasDiscount ? styles.colTotalBase : styles.colTotalNoDiscount,
    discount: hasDiscount ? styles.colDiscountBase : {}, // Empty object if hidden
    paid: hasDiscount ? styles.colPaidBase : styles.colPaidNoDiscount,
    unpaid: hasDiscount ? styles.colUnpaidBase : styles.colUnpaidNoDiscount,
    status: hasDiscount ? styles.colStatusBase : styles.colStatusNoDiscount,
  };

  // Calculate dynamic footer label width (stops BEFORE Total column)
  let footerLabelWidth = 0;
  if (hasBranch) footerLabelWidth += parseFloat(styles.colBranchBase.width);
  footerLabelWidth += parseFloat(colWidths.invoiceNum.width);
  footerLabelWidth += parseFloat(colWidths.date.width);
  if (hasPO) {
    footerLabelWidth += parseFloat(styles.colPOBase.width); // Access the base style width directly
  }
  // DO NOT add discount width here

  const footerLabelStyle = { width: `${footerLabelWidth}%` };
  // --- End Dynamic Width Calculation ---

  return (
    <Document title={`Statement-${statement.customerName}-${dateRange}`}>
      <Page size="A4" style={styles.page}>
        {/* Watermark Image - Place early or use zIndex */}
        {/* <Image
          style={styles.watermark}
          src={`${baseUrl}/img/logo/kilimolink-logo-symbol.png`} // Use absolute URL
          fixed
        /> */}

        {/* Fixed View for Page Numbers */}
        <Text
          style={styles.pageNumber}
          render={
            ({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}` // Updated format
          }
          fixed // Make it stay in place on every page
        />

        {/* Header Section */}
        <View style={styles.header}>
          {/* Left Side: Logo */}
          <View style={styles.headerLeft}>
            <Image
              style={styles.logo}
              src="https://www.kilimolink.com/img/logo/logo-primary-by-lolkirr.png" // Use absolute URL
            />
            {/* REMOVED Company Address Text */}
          </View>
          {/* Right Side: Title and Date Range */}
          <View style={styles.headerRight}>
            <Text style={styles.statementTitle}>Statement of Account</Text>
            {/* Removed "Date Range: " prefix */}
            <Text style={styles.dateRange}>{dateRange}</Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Bill To:</Text>
          <Text style={styles.text}>{statement.customerName}</Text>
          {/* Add KRA PIN if available */}
          {statement.kraPinNumber && (
            <Text style={styles.text}>PIN: {statement.kraPinNumber}</Text>
          )}
          {/* Add address if available */}
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* --- Invoice Table --- */}
        {statement.invoices.length === 0 ? (
          <Text style={{ marginTop: 20, fontSize: 10, color: "gray" }}>
            No invoices found for this period.
          </Text>
        ) : (
          <View style={styles.table}>
            {/* Table Header - Dynamic Layout */}
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              {hasBranch && ( // Conditionally render Branch
                <Text style={[styles.tableColHeader, colWidths.branch]}>
                  Affiliate
                </Text>
              )}
              <Text style={[styles.tableColHeader, colWidths.invoiceNum]}>
                Invoice #
              </Text>
              <Text style={[styles.tableColHeader, colWidths.date]}>
                Invoice Date
              </Text>
              {hasPO && ( // Conditionally render PO Header
                <Text style={[styles.tableColHeader, colWidths.po]}>
                  PO Number
                </Text>
              )}
              <Text style={[styles.tableColHeader, colWidths.total]}>
                Total
              </Text>
              {hasDiscount && ( // Conditionally render Discount
                <Text style={[styles.tableColHeader, colWidths.discount]}>
                  Discount
                </Text>
              )}
              <Text style={[styles.tableColHeader, colWidths.paid]}>Paid</Text>
              <Text style={[styles.tableColHeader, colWidths.unpaid]}>
                Unpaid
              </Text>
              <Text style={[styles.tableColHeader, colWidths.status]}>
                Status
              </Text>
            </View>
            {/* Table Body - Dynamic Layout */}
            {statement.invoices.map((invoice: any) => {
              // Calculate value for this row's 'Paid' cell
              const invoicePreDiscountTotal = invoice.total ?? 0;
              const discountAmount = invoice.discount?.amount ?? 0;
              const discountedTotal = invoicePreDiscountTotal - discountAmount;
              const paidColumnValue =
                invoice.paymentStatus === "Paid"
                  ? discountedTotal // Show discounted total if paid
                  : invoice.amountPaid; // Show actual amount paid otherwise

              return (
                <View
                  style={styles.tableRow}
                  key={invoice.invoiceId}
                  wrap={false} // Prevent rows from breaking across pages if possible
                >
                  {hasBranch && ( // Conditionally render Branch
                    <Text style={[styles.tableCol, colWidths.branch]}>
                      {invoice.branch || "-"}
                    </Text>
                  )}
                  <Text style={[styles.tableCol, colWidths.invoiceNum]}>
                    {invoice.invoiceNumber || "-"}
                  </Text>
                  <Text style={[styles.tableCol, colWidths.date]}>
                    {invoice.invoiceDate
                      ? format(new Date(invoice.invoiceDate), "MMM dd, yyyy")
                      : "-"}
                  </Text>
                  {hasPO && ( // Conditionally render PO Cell
                    <Text style={[styles.tableCol, colWidths.po]}>
                      {invoice.poNumber || "-"}
                    </Text>
                  )}
                  <Text style={[styles.tableCol, colWidths.total]}>
                    {formatCurrencyPDF(invoice.total, false)}
                  </Text>
                  {hasDiscount && (
                    <Text style={[styles.tableCol, colWidths.discount]}>
                      {invoice.discount
                        ? `${formatCurrencyPDF(
                            invoice.discount.amount,
                            false // No KES symbol
                          )}${
                            invoice.discount.percentage
                              ? ` (${invoice.discount.percentage}%)`
                              : ""
                          }`
                        : "-"}
                    </Text>
                  )}
                  {/* Updated Paid Cell */}
                  <Text style={[styles.tableCol, colWidths.paid]}>
                    {formatCurrencyPDF(paidColumnValue, false)}
                  </Text>
                  <Text style={[styles.tableCol, colWidths.unpaid]}>
                    {formatCurrencyPDF(invoice.amountOwed, false)}
                  </Text>
                  <Text style={[styles.tableCol, colWidths.status]}>
                    {invoice.paymentStatus || "N/A"}
                  </Text>
                </View>
              );
            })}
            {/* Table Footer - Dynamic Layout */}
            <View style={styles.tableFooter}>
              {/* Updated Totals Label */}
              <Text style={[styles.footerTotalsLabel, footerLabelStyle]}>
                Totals (KES):
              </Text>
              {/* Order: Total(Pre), Discount?, Paid, Unpaid, Status */}
              {/* Corrected Order and Formatting */}
              <Text style={[styles.footerTotalValue, colWidths.total]}>
                {formatCurrencyPDF(totalPreDiscount, false)}
              </Text>
              {hasDiscount && (
                <Text style={[styles.footerTotalValue, colWidths.discount]}>
                  {formatCurrencyPDF(totalDiscountAmount, false)}
                </Text>
              )}
              <Text style={[styles.footerTotalValue, colWidths.paid]}>
                {formatCurrencyPDF(totalPaidDisplay, false)}
              </Text>
              <Text style={[styles.footerTotalValue, colWidths.unpaid]}>
                {formatCurrencyPDF(totalOwed, false)}
              </Text>
              <Text style={[styles.footerStatus, colWidths.status]}>
                {isAnyUnpaid ? "Due" : ""}
              </Text>
            </View>
          </View>
        )}
        {/* --- End Invoice Table --- */}

        {/* Separator before Payment Details */}
        <View style={styles.separator} />

        {/* Payment Details Section */}
        {statement.customerBank && (
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentDetailsLabel}>Payment Details:</Text>
            {statement.customerBank.accName && (
              <Text>Account Name: {statement.customerBank.accName}</Text>
            )}
            {statement.customerBank.accNumber && (
              <Text>Account No: {statement.customerBank.accNumber}</Text>
            )}
            {statement.customerBank.bankName && (
              <Text>Bank: {statement.customerBank.bankName}</Text>
            )}
            {statement.customerBank.bankBranch && (
              <Text>Branch: {statement.customerBank.bankBranch}</Text>
            )}
            {statement.customerBank.swiftCode && (
              <Text>SWIFT: {statement.customerBank.swiftCode}</Text>
            )}
            {statement.customerBank.mpesaBusinessNumber && (
              <Text>
                M-Pesa Paybill: {statement.customerBank.mpesaBusinessNumber}
              </Text>
            )}
            {statement.customerBank.mpesaAccNumber && (
              <Text>
                M-Pesa Account: {statement.customerBank.mpesaAccNumber}
              </Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default StatementPDF;
