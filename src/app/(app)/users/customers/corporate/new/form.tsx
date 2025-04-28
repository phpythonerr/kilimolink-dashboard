"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { registerCustomer } from "./actions"; // Only import the action
import {
  CustomerSchema,
  CustomerFormData,
  BusinessTypeEnum, // Import enums if needed for options
  PaymentTermsEnum,
  CommissionTypeEnum,
} from "./schemas"; // Import schema and type from schemas.ts

// Re-define types matching page.tsx props
type PriceList = {
  id: string;
  name: string;
};

type BankAccount = {
  id: string;
  acc_name: string;
};

type Category = {
  id: string;
  name: string;
};

interface CustomerFormProps {
  priceLists: PriceList[];
  bankAccounts: BankAccount[];
  categories: Category[];
}

// Use imported enums for options
const businessTypes = BusinessTypeEnum.options;
const paymentTermsOptions = PaymentTermsEnum.options;
const commissionTypeOptions = CommissionTypeEnum.options;

export default function CustomerForm({
  priceLists,
  bankAccounts,
  categories,
}: CustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(CustomerSchema), // Use the schema from the action
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessName: "",
      businessType: undefined, // Or a default like "Other"
      deliveryAddress: "",
      kraPinNumber: "",
      priceCategory: undefined,
      paymentTerms: "Pay on Delivery", // Default payment term
      invoiceBankAccount: undefined,
      hasCommission: false,
      commissionType: "Percentage", // Default even if hidden
      commissionAmount: undefined,
      enabledCategories: [],
    },
  });

  const hasCommissionValue = form.watch("hasCommission");

  async function onSubmit(data: CustomerFormData) {
    setIsLoading(true); // Keep for button disabling

    // Ensure commission fields are null if hasCommission is false
    const payload = {
      ...data,
      commissionType: data.hasCommission ? data.commissionType : undefined,
      commissionAmount: data.hasCommission ? data.commissionAmount : undefined,
    };

    // Wrap the action call with toast.promise
    toast.promise(registerCustomer(payload), {
      loading: "Registering customer...",
      success: (result) => {
        // Handle success case
        router.push("/users/customers/corporate");
        router.refresh(); // Refresh server components
        setIsLoading(false); // Re-enable button on success
        return result.message || "Customer registered successfully!"; // Return success message for toast
      },
      error: (result) => {
        // Handle error case (promise resolved with success: false or rejected)
        setIsLoading(false); // Re-enable button on error

        // Handle field-specific errors if returned from action
        if (result && result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(field as keyof CustomerFormData, {
                type: "server",
                message: messages.join(", "),
              });
            }
          });
        }
        // Return error message for toast
        return result?.message || "Failed to register customer.";
      },
      // No finally needed here as success/error handle setIsLoading
    });

    // Removed the previous if/else block for handling result and toast calls
    // Removed setIsLoading(false) from here as it's handled in success/error callbacks
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Personal Details */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+254 7XX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Business Details */}
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Company Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypes.map((type: any) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                {" "}
                {/* Span across 2 cols */}
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Nairobi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kraPinNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KRA PIN (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="P0..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Financial Details */}
          <FormField
            control={form.control}
            name="priceCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select price category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priceLists.map((list: any) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentTermsOptions.map((term: any) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceBankAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Bank Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankAccounts.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.acc_name} - {acc.bank_name} ({acc.acc_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Commission Section */}
        <div className="flex flex-col gap-4 rounded-md border p-4">
          <FormField
            control={form.control}
            name="hasCommission"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <FormLabel>Enable Commission</FormLabel>
                  <FormDescription>
                    Does this customer earn commission?
                  </FormDescription>
                </div>
                <FormControl>
                  {/* Using RadioGroup for Yes/No boolean */}
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "yes")}
                    value={field.value ? "yes" : "no"}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {hasCommissionValue && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="commissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required={hasCommissionValue} // Mark as required visually/semantically
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select commission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commissionTypeOptions.map((type: any) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commissionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Amount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        min="0"
                        max="100"
                        step="0.1" // Allow decimals if needed
                        // Ensure the input value is never undefined, default to empty string
                        value={field.value ?? ""}
                        // Convert value to number or undefined on change for react-hook-form state
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined // Set undefined in form state if input is cleared
                              : parseFloat(e.target.value)
                          )
                        }
                        onBlur={field.onBlur} // Ensure onBlur is included
                        ref={field.ref} // Ensure ref is included
                        name={field.name} // Ensure name is included
                        required={hasCommissionValue}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Enabled Categories Section */}
        <FormField
          control={form.control}
          name="enabledCategories"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Enabled Categories</FormLabel>
                <FormDescription>
                  Select the commodity categories this customer can order from.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((category: any) => (
                  <FormField
                    key={category.id}
                    control={form.control}
                    name="enabledCategories"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={category.id}
                          className="flex flex-row items-start"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([
                                      ...(field.value ?? []),
                                      category.id,
                                    ])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== category.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {category.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage /> {/* Show error if no categories selected */}
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" disabled={isLoading} className="w-auto">
            {isLoading ? "Registering..." : "Register Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
