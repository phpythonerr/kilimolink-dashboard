"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Define input schema for validation - changed to single customerId
const StatementInputSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  customerId: z.string({ required_error: "Customer selection is required." }), // Changed from customerIds array
});

// Define Bank Details structure
type BankDetails = {
  accNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  swiftCode: string | null;
  mpesaBusinessNumber: string | null;
  mpesaAccNumber: string | null;
  accName: string | null;
};

// Define the structure of the returned data
export type StatementData = {
  customerId: string;
  customerName: string | null;
  kraPinNumber: string | null; // Added KRA PIN
  customerBank: BankDetails | null; // Renamed from bankDetails
  invoices: {
    invoiceId: number; // Assuming order ID is the unique identifier for an invoice context
    invoiceNumber: string | null;
    invoiceDate: string | null; // Added Invoice Date (from delivery_date)
    poNumber: string | null; // Added PO Number
    branch: string | null; // Added Branch
    total: number | null; // This will be order total + sum of POSITIVE revenues
    discount: number | null; // Added Discount
    paymentStatus: string | null; // Status from orders_order table
    amountPaid: number; // Calculated from finance_revenue (negative values)
    amountOwed: number; // Calculated based on status: (total + positive revenues) - payments IF Partially Paid, OR total + positive revenues IF Unpaid, OR 0 IF Paid
  }[];
};

export async function generateStatement(
  input: z.infer<typeof StatementInputSchema>
): Promise<StatementData[]> {
  const validation = StatementInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error("Invalid input: " + validation.error.message);
  }

  const { startDate, endDate, customerId } = validation.data; // Changed from customerIds
  const supabase = await createClient(); // Re-added await

  try {
    // 1. Fetch selected customer's profile including bank_account FK and KRA PIN
    const { data: customerProfileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, business_name, bank_account, kra_pin_number") // Added kra_pin_number
      .eq("id", customerId) // Changed from .in() to .eq()
      .maybeSingle(); // Expect one or null

    if (profileError) throw profileError;
    if (!customerProfileData) {
      // Handle case where the specific customer ID wasn't found
      console.warn(`Customer profile not found for ID: ${customerId}`);
      return [];
    }

    const customerProfile = {
      id: customerProfileData.id,
      name: customerProfileData.business_name,
      bankAccountId: customerProfileData.bank_account, // Store the FK ID
      kraPinNumber: customerProfileData.kra_pin_number, // Store KRA PIN
    };

    // 2. Conditionally fetch bank account details
    let bankDetails: BankDetails | null = null;
    if (customerProfile.bankAccountId) {
      const { data: accountData, error: accountError } = await supabase
        .from("finance_account") // Assuming this is the table name
        .select(
          "acc_number, bank_name, bank_branch, swift_code, mpesa_business_number, mpesa_acc_number, acc_name"
        )
        .eq("id", customerProfile.bankAccountId) // Match using the FK
        .maybeSingle();

      if (accountError) {
        console.error("Error fetching bank account details:", accountError);
        // Decide how to handle: throw, return null, or continue without bank details
      } else if (accountData) {
        bankDetails = {
          accNumber: accountData.acc_number,
          bankName: accountData.bank_name,
          bankBranch: accountData.bank_branch,
          swiftCode: accountData.swift_code,
          mpesaBusinessNumber: accountData.mpesa_business_number,
          mpesaAccNumber: accountData.mpesa_acc_number,
          accName: accountData.acc_name,
        };
      }
    }

    // 3. Fetch relevant orders for this customer within the date range
    // Ensure dates are formatted correctly for Supabase (ISO 8601 string)
    const isoStartDate = startDate.toISOString();
    const isoEndDate = endDate.toISOString();

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders_order") // Use table name as string
      .select(
        "id, user, order_number, po_number, branch, total, discount, payment_status, delivery_date" // Added branch
      )
      .eq("user", customerId) // Changed from .in() to .eq()
      .gte("delivery_date", isoStartDate) // Use ISO string dates
      .lte("delivery_date", isoEndDate)
      .order("order_number", { ascending: false }); // Order by order_number descending

    if (ordersError) throw ordersError;

    // Map to expected structure (adjust column names as needed)
    const orders = (ordersData || []).map((o: any) => ({
      id: o.id,
      customerId: o.user,
      orderNumber: o.order_number,
      poNumber: o.po_number, // Added po_number
      branch: o.branch, // Added branch
      total: o.total,
      discount: o.discount, // Added discount
      paymentStatus: o.payment_status,
      deliveryDate: o.delivery_date, // Added deliveryDate
    }));

    // Handle case where customer exists but has no orders in the range
    if (orders.length === 0) {
      return [
        // Return array with one element containing empty invoices
        {
          customerId: customerProfile.id,
          customerName: customerProfile.name,
          kraPinNumber: customerProfile.kraPinNumber, // Add KRA PIN here too
          customerBank: bankDetails, // Use renamed property
          invoices: [],
        },
      ];
    }

    const orderIds = orders.map((o: any) => o.id);

    // 4. Fetch related revenue entries for these orders (includes charges AND payments)
    const { data: revenueEntriesData, error: revenueError } = await supabase
      .from("finance_revenue") // Use table name as string
      .select("order_id, amount") // Adjust column names
      .in("order_id", orderIds);

    if (revenueError) throw revenueError;

    // Map to expected structure (adjust column names as needed)
    const revenueEntries = (revenueEntriesData || []).map((r: any) => ({
      orderId: r.order_id,
      // Ensure amount is a number
      amount:
        typeof r.amount === "number" ? r.amount : parseFloat(r.amount || "0"),
    }));

    // 5. REMOVED fetch for finance_payment

    // 6. Calculate totals per order (Processing finance_revenue for charges and payments)
    const chargesAndPaymentsPerOrder = revenueEntries.reduce(
      (acc, entry) => {
        if (entry.orderId !== null && !isNaN(entry.amount)) {
          if (!acc[entry.orderId]) {
            // Initialize if first entry for this order
            acc[entry.orderId] = { charges: 0, payments: 0 };
          }
          if (entry.amount > 0) {
            // Positive amounts are charges/revenues
            acc[entry.orderId].charges += entry.amount;
          } else if (entry.amount < 0) {
            // Negative amounts are payments (store as positive value for 'paid')
            acc[entry.orderId].payments += Math.abs(entry.amount);
          }
        }
        return acc;
      },
      {} as Record<number, { charges: number; payments: number }> // Structure to hold both
    );

    // 7. Structure the data (Adjusting calculations)
    const customerOrders = orders;
    const result: StatementData = {
      customerId: customerProfile.id,
      customerName: customerProfile.name,
      kraPinNumber: customerProfile.kraPinNumber, // Add KRA PIN to final result
      customerBank: bankDetails,
      invoices: customerOrders.map((order: any) => {
        const orderChargesPayments = chargesAndPaymentsPerOrder[order.id] || {
          charges: 0,
          payments: 0,
        };
        const additionalCharges = orderChargesPayments.charges;
        const amountPaid = orderChargesPayments.payments; // Use calculated payments from negative revenues

        const orderTotal =
          typeof order.total === "number"
            ? order.total
            : parseFloat(order.total || "0");
        const baseTotal = isNaN(orderTotal) ? 0 : orderTotal; // Base total for calculations

        // Calculate the effective total including positive revenues/charges
        const effectiveTotal = baseTotal + additionalCharges;

        // Calculate amount owed based on payment status
        let calculatedAmountOwed = 0;
        if (order.paymentStatus === "Unpaid") {
          // If status is Unpaid, the full effective total is owed.
          calculatedAmountOwed = effectiveTotal;
        } else if (order.paymentStatus === "Partially Paid") {
          // If status is Partially Paid, the difference is owed.
          calculatedAmountOwed = effectiveTotal - amountPaid;
        }
        // If status is 'Paid' or anything else, amount owed remains 0.

        // Ensure amount owed isn't negative (e.g., due to overpayment or data issues)
        calculatedAmountOwed = Math.max(0, calculatedAmountOwed);

        const discount =
          typeof order.discount === "number"
            ? order.discount
            : parseFloat(order.discount || "0");

        return {
          invoiceId: order.id,
          invoiceNumber: order.orderNumber,
          invoiceDate: order.deliveryDate,
          poNumber: order.poNumber,
          branch: order.branch,
          total: effectiveTotal === 0 ? null : effectiveTotal,
          discount: isNaN(discount) ? null : discount,
          paymentStatus: order.paymentStatus,
          amountPaid: amountPaid,
          // Use the amount owed calculated based on status
          amountOwed: calculatedAmountOwed,
        };
      }),
    };

    return [result];
  } catch (error) {
    console.error("Error generating statement:", error);
    // Consider more specific error handling or logging
    // Check if it's a Supabase PostgrestError
    if (error && typeof error === "object" && "message" in error) {
      throw new Error(
        `Database error: ${error.message || "Unknown Supabase error"}`
      );
    }
    throw new Error("An unexpected error occurred while generating statement.");
  }
}
