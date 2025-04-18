"use client";

import { cn, handleNumberInput } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createPurchase } from "./actions";

const formSchema = z
  .object({
    sellerType: z.string().min(1, "Seller Type is required"),
    vendorId: z.string().min(1, "Vendor is required"),
    productId: z.string().min(1, "Product is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    quantity: z.string().min(1, "Quantity is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    paymentTerms: z.string().min(1, "Payment terms is required"),
    productUoM: z.string().min(1, "Product UoM is required"),
    paymentStatus: z.string().min(1, "Payment Status is required"),
    paidAmount: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentStatus === "Partially-Paid") {
        const amount = Number(data.paidAmount);
        const total = Number(data.unitPrice) * Number(data.quantity);
        return amount > 0 && amount < total;
      }
      return true;
    },
    {
      message: "Paid amount must be greater than 0 and less than total amount",
      path: ["paidAmount"],
    }
  )
  .superRefine((data, ctx) => {
    if (data.paymentStatus === "Partially-Paid" && !data.paidAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Paid amount is required for partially paid purchases",
        path: ["paidAmount"],
      });
    }
  });

export default function NewPurchaseForm({ vendors, products }: any) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const { push } = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sellerType: "vendor",
      vendorId: "",
      productId: "",
      unitPrice: "",
      quantity: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      paymentTerms: "",
      productUoM: "",
      paymentStatus: "Unpaid",
      paidAmount: "",
    },
  });

  const selectedUnitPrice = form.watch("unitPrice");

  const selectedQuantity = form.watch("quantity");

  const selectedProductId = form.watch("productId");

  const selectedSellerType = form.watch("sellerType");

  const selectedPaymentStatus = form.watch("paymentStatus");

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (submitting) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("vendorId", data.vendorId);
    formData.append("productId", data.productId);
    formData.append("unitPrice", data.unitPrice);
    formData.append("quantity", data.quantity);
    formData.append("purchaseDate", data.purchaseDate);
    formData.append("paymentTerms", data.paymentTerms);
    formData.append("productUoM", data.productUoM);
    formData.append("paymentStatus", data.paymentStatus);
    formData.append("sellerType", data.sellerType);
    formData.append("paidAmount", data.paidAmount || "0"); // Ensure paidAmount is a string, default to "0" if not provided

    await toast.promise(createPurchase(formData), {
      loading: "Creating purchase...",
      success: (res) => {
        if (res?.success) {
          push(`/accounting/expenses/purchases/`);
          return "Purchase created successfully.";
        }
        throw new Error(
          res?.error || "Failed to create purchase. Please try again"
        );
      },
      error: (err) => {
        setSubmitting(false);
        return err instanceof Error ? err.message : "Failed to create purchase";
      },
      finally: () => {
        setSubmitting(false);
      },
    });
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((vendor: any) => vendor.id === vendorId);
    if (!vendor) return "Unknown Vendor";

    const tradeName = vendor.user_metadata?.tradeName;
    const firstName =
      vendor.user_metadata?.first_name || vendor.user_metadata?.firstName;
    const lastName =
      vendor.user_metadata?.last_name || vendor.user_metadata?.lastName;

    return tradeName
      ? `${firstName} ${lastName} (${tradeName})`
      : `${firstName} ${lastName}`;
  };

  const getProductUoM = (productId: string) => {
    const product = products.find((product: any) => product.id === productId);
    if (!product) return "Unknown Product";
    return product?.quantity_unit_options;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sellerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seller Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Seller Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="capitalize">
                {selectedSellerType || "Vendor"}
              </FormLabel>
              <Popover
                open={vendorPopoverOpen}
                onOpenChange={setVendorPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between capitalize",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? getVendorName(field.value)
                        : `Select ${selectedSellerType}`}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder={`Select ${selectedSellerType}`}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>{`No ${selectedSellerType} found`}</CommandEmpty>
                      <CommandGroup>
                        {vendors
                          ?.filter(
                            (user: any) =>
                              user?.user_metadata?.user_type ===
                              selectedSellerType
                          )
                          .map((vendor: any) => (
                            <CommandItem
                              value={getVendorName(vendor?.id)}
                              key={vendor?.id}
                              onSelect={() => {
                                form.setValue("vendorId", vendor?.id);
                                setVendorPopoverOpen(false);
                              }}
                            >
                              {getVendorName(vendor?.id)}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  vendor?.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
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

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Popover
                open={productPopoverOpen}
                onOpenChange={setProductPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? products.find(
                            (product: any) => product?.id === field.value
                          )?.name
                        : "Select Product"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search product..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No product found.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product: any) => (
                          <CommandItem
                            value={product?.name}
                            key={product?.id}
                            onSelect={() => {
                              form.setValue("productId", product?.id);
                              setProductPopoverOpen(false);
                            }}
                          >
                            {product?.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                product?.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
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

        <div className="flex flex-1 items-center gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input
                      onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNumberInput(e, e?.target?.value)
                      }
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1 flex gap-2 items-center">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleNumberInput(e, e?.target?.value)
                        }
                        placeholder=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {selectedProductId && (
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="productUoM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UoM</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select UoM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getProductUoM(selectedProductId).map(
                            (uom: string) => (
                              <SelectItem key={uom} value={uom}>
                                {uom}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Purchase</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Payment Terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Partial-Credit">Partial Credit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Payment Terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Paid">Fully Paid</SelectItem>
                  <SelectItem value="Partially-Paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedPaymentStatus === "Partially-Paid" && (
          <FormField
            control={form.control}
            name="paidAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid Amount</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Please wait
            </>
          ) : (
            "Submit Purchase"
          )}
        </Button>
      </form>
    </Form>
  );
}
