"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn, handleNumberInput } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchasesInterface } from "./columns";
import { updatePurchase } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  productId: z.string().min(1, "Product is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  quantity: z.string().min(1, "Quantity is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  paymentTerms: z.string().min(1, "Payment terms is required"),
  productUoM: z.string().min(1, "UoM is required"),
  sellerType: z.string().min(1, "Seller type is required"),
});

interface EditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: PurchasesInterface;
}

export function EditSheet({ open, onOpenChange, purchase }: EditSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [vendorPopoverOpen, setVendorPopoverOpen] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: purchase.user_obj?.id || "",
      productId: purchase.product_id?.id || "",
      unitPrice: purchase.unit_price?.toString() || "",
      quantity: purchase.quantity?.toString() || "",
      purchaseDate: purchase.purchase_date
        ? new Date(purchase.purchase_date).toISOString().split("T")[0]
        : "",
      paymentTerms: purchase.payment_terms || "Credit",
      productUoM: purchase.product_uom || "",
      sellerType: purchase.seller_type || "vendor",
    },
  });

  const selectedProductId = form.watch("productId");

  // Fetch vendors and products when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/data/vendors");
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }

        const productsResponse = await fetch("/api/data/products");
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (open) {
      fetchData();
    }
  }, [open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    const formData = new FormData();
    formData.append("purchaseId", purchase.id);
    formData.append("vendorId", values.vendorId);
    formData.append("productId", values.productId);
    formData.append("unitPrice", values.unitPrice);
    formData.append("quantity", values.quantity);
    formData.append("purchaseDate", values.purchaseDate);
    formData.append("paymentTerms", values.paymentTerms);
    formData.append("productUoM", values.productUoM);
    formData.append("sellerType", values.sellerType);

    // toast.promise(
    //   updatePurchase(formData).finally(() => {
    //     setIsSubmitting(false);
    //     onOpenChange(false);
    //   }),
    //   {
    //     loading: "Updating purchase...",
    //     success: (res) => {
    //       if (res?.success) {
    //         return "Purchase updated successfully";
    //       }
    //       throw new Error(res?.error || "Failed to update purchase");
    //     },
    //     error: (err) => {
    //       return err instanceof Error
    //         ? err.message
    //         : "Failed to update purchase";
    //     },
    //   }
    // );
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
    if (!product) return ["kg", "g", "l", "ml"]; // Default UoM options
    return product?.quantity_unit_options || ["kg", "g", "l", "ml"];
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="text-lg">Edit Purchase</SheetTitle>
          <SheetDescription>
            Make changes to the purchase record. Click save when done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4 px-4 max-h-[80vh] overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="sellerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <FormLabel>Vendor</FormLabel>
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
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && vendors.length > 0
                            ? getVendorName(field.value)
                            : "Select Vendor"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search vendor..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No vendor found</CommandEmpty>
                          <CommandGroup>
                            {vendors
                              ?.filter(
                                (vendor: any) =>
                                  vendor?.user_metadata?.user_type ===
                                  form.getValues("sellerType")
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
                          {field.value && products.length > 0
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
                          <CommandEmpty>No product found</CommandEmpty>
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
                            {selectedProductId && products.length > 0
                              ? getProductUoM(selectedProductId).map(
                                  (uom: string) => (
                                    <SelectItem key={uom} value={uom}>
                                      {uom}
                                    </SelectItem>
                                  )
                                )
                              : ["kg", "g", "l", "ml"].map((uom) => (
                                  <SelectItem key={uom} value={uom}>
                                    {uom}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Payment Terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit">Credit</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Partial-Credit">
                        Partial Credit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
