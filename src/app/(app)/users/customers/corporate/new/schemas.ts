import { z } from "zod";

// Enum definitions for validation
export const BusinessTypeEnum = z.enum([
  "Lodge/Camp",
  "Hotel",
  "Restaurant",
  "School",
  "Hospital",
  "Kiosk",
  "Food Processor",
  "Other",
]);

export const PaymentTermsEnum = z.enum([
  "Pre-paid",
  "Pay on Delivery",
  "24 Hours Credit",
  "48 Hours Credit",
  "7 days credit",
  "14 days credit",
  "30 days credit",
]);

export const CommissionTypeEnum = z.enum(["Percentage"]);

// Main Customer Schema
export const CustomerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(1, "Phone number is required."),
    businessName: z.string().min(1, "Business name is required."),
    businessType: BusinessTypeEnum,
    deliveryAddress: z.string().min(1, "Delivery address is required."),
    kraPinNumber: z.string().optional(),
    priceCategory: z.string().min(1, "Price category is required."),
    paymentTerms: PaymentTermsEnum,
    invoiceBankAccount: z.string().min(1, "Invoice bank account is required."),
    hasCommission: z.boolean().default(false),
    commissionType: CommissionTypeEnum.optional(),
    commissionAmount: z
      .number()
      .min(0, "Commission must be at least 0.")
      .max(100, "Commission cannot exceed 100.")
      .optional(),
    enabledCategories: z
      .array(z.string())
      .min(1, "At least one category must be enabled."),
  })
  .refine(
    (data) => {
      if (data.hasCommission) {
        return !!data.commissionType && data.commissionAmount !== undefined;
      }
      return true;
    },
    {
      message:
        "Commission type and amount are required when commission is enabled.",
      path: ["commissionType"],
    }
  )
  .refine(
    (data) => {
      if (data.hasCommission) {
        return data.commissionAmount !== undefined;
      }
      return true;
    },
    {
      message: "Commission amount is required when commission is enabled.",
      path: ["commissionAmount"],
    }
  );

export type CustomerFormData = z.infer<typeof CustomerSchema>;
