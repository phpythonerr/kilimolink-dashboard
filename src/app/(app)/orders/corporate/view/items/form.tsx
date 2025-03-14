"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { RowOverlay } from "./components/RowOverlay";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
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

import { calculateTotals } from "./utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, X, LoaderCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateProduct,
  updateUoM,
  updateUnitCost,
  updateUnitPrice,
  updateQty,
  deleteItem,
} from "./actions";

export default function Form({ products, items, order }: any) {
  const [deleteLoadingMap, setDeleteLoadingMap] = useState<{
    [key: string]: boolean;
  }>({});

  let items_arr: any = [];
  if (items.length > 0) {
    items.map((item: any) =>
      items_arr.push({
        id: item?.id,
        buying_price: item?.buying_price,
        selling_price: item?.selling_price,
        quantity: item?.quantity,
        uom: item?.uom || item?.commodity_id?.quantity_unit,
        commodity_id: item?.commodity_id?.id,
        note: item?.note,
        customer: item?.customer,
        loading: false,
      })
    );
  } else {
    items_arr.push({
      id: "no_item",
      buying_price: "",
      selling_price: "",
      quantity: "",
      uom: "no_uom",
      commodity_id: "",
      note: "",
      customer: "",
      uom_options: [],
      loading: false,
    });
  }

  const [orderItems, setOrderItems] = useState<[]>(items_arr);

  const [productPopoverOpenStates, setProductPopverOpenStates] = useState(
    orderItems.map(() => false)
  );

  const handleOpenChange = (index: number, open: boolean) => {
    const newProductPopoverOpenStates = [...productPopoverOpenStates];
    newProductPopoverOpenStates[index] = open;
    setProductPopverOpenStates(newProductPopoverOpenStates);
  };

  const addItemRow = () => {
    setOrderItems([
      ...orderItems,
      {
        id: "no_item",
        buying_price: "",
        selling_price: "",
        quantity: "",
        uom: "no_uom",
        commodity_id: "",
        note: "",
        customer: "",
        uom_options: [],
        loading: false,
      },
    ]);
  };

  const removeItemRow = async (i: any, item_id: string) => {
    try {
      setDeleteLoadingMap((prev) => ({ ...prev, [i]: true }));
      let newItems = [...orderItems];
      if (item_id !== "no_item") {
        let res = await deleteItem(item_id, order?.id);
        if (res?.success) {
          newItems.splice(i, 1);
        } else {
          toast.error(`Item not removed: ${res?.error?.message}`);
        }
      } else {
        newItems.splice(i, 1);
      }
      if (newItems.length < 1) {
        newItems = [
          ...newItems,
          {
            id: "no_item",
            buying_price: "",
            selling_price: "",
            quantity: "",
            uom: "no_uom",
            commodity_id: "",
            note: "",
            customer: "",
            uom_options: [],
            loading: false,
          },
        ];
      }
      setOrderItems(newItems);
    } catch (err) {
    } finally {
      setDeleteLoadingMap((prev) => ({ ...prev, [i]: false }));
    }
  };

  const getSelectedProductIds = () => {
    return orderItems
      .filter((item) => item.commodity_id && item.commodity_id !== "no_item")
      .map((item) => item.commodity_id);
  };

  // Filter available products
  const getAvailableProducts = (currentItemId: string) => {
    const selectedIds = getSelectedProductIds();
    return products.filter(
      (product) =>
        product.id === currentItemId || !selectedIds.includes(product.id)
    );
  };

  const formatNumber = (value: string | number) => {
    if (!value) return "";
    return value.toString().replace(/[^\d]/g, "");
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentValue: string
  ) => {
    const formatted = formatNumber(e.target.value);
    if (formatted === "" || formatted === "0") {
      e.target.value = "";
    } else {
      e.target.value = formatted;
    }
  };

  if (!products || !order) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={9}>Loading...</TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {orderItems?.map((item: any, index: number) => (
        <TableRow key={`${item?.id}-${index}`}>
          <TableCell>
            <Popover
              open={productPopoverOpenStates[index]}
              onOpenChange={(open) => handleOpenChange(index, open)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-48 justify-between text-xs",
                    (!item?.commodity_id || item?.commodity_id === "no_item") &&
                      "text-muted-foreground"
                  )}
                >
                  {item?.commodity_id && item?.commodity_id !== "no_item"
                    ? products.find(
                        (product: any) => product?.id === item?.commodity_id
                      )?.name
                    : "Select Product"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <Command>
                  <CommandInput
                    placeholder="Search Product..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {getAvailableProducts(item.commodity_id)?.map(
                        (product: any) => (
                          <CommandItem
                            className="text-xs"
                            value={product?.name}
                            key={product?.id}
                            onSelect={async () => {
                              const newItems = [...orderItems];

                              newItems[index]["commodity_id"] =
                                product?.id || null;
                              setOrderItems(newItems);
                              const newProductPopoverOpenStates = [
                                ...productPopoverOpenStates,
                              ];
                              newProductPopoverOpenStates[index] = false;
                              setProductPopverOpenStates(
                                newProductPopoverOpenStates
                              );

                              try {
                                orderItems[index]["loading"] = true;
                                const fd: any = new FormData();
                                fd.append("commodity_id", product?.id);
                                fd.append("item_id", item?.id);
                                fd.append("customer", order?.user);
                                fd.append("buying_price", item?.buying_price);
                                fd.append("selling_price", item?.selling_price);
                                fd.append(
                                  "delivery_date",
                                  order?.delivery_date
                                );
                                fd.append("order_id", order?.id);
                                fd.append(
                                  "uom",
                                  item?.oum !== "no_uom"
                                    ? item?.uom
                                    : products.find(
                                        (product: any) =>
                                          product?.id === item?.commodity_id
                                      )?.quantity_unit
                                );

                                let res = await updateProduct(fd);

                                if (res?.success) {
                                  const newItems = [...orderItems];
                                  newItems[index]["id"] = String(res?.id);
                                  newItems[index]["quantity"] = Number(
                                    res?.quantity
                                  );
                                  newItems[index]["uom"] = String(res?.uom);
                                  newItems[index]["buying_price"] = Number(
                                    res?.buying_price
                                  );
                                  newItems[index]["selling_price"] = Number(
                                    res?.selling_price
                                  );
                                  newItems[index]["loading"] = false;

                                  setOrderItems(newItems);
                                } else {
                                  alert(JSON.stringify(res));
                                }
                              } catch (err) {
                                alert(JSON.stringify(err));
                              } finally {
                              }
                            }}
                          >
                            {product?.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                product?.id === item?.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        )
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </TableCell>
          <TableCell>
            <Input
              type="text"
              defaultValue={item?.quantity || ""}
              className="w-16 text-xs"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumberInput(e, item?.quantity)
              }
              onBlur={async (e) => {
                if (
                  item?.id !== "no_item" &&
                  e.target.value !== item?.quantity?.toString()
                ) {
                  try {
                    const fd = new FormData();
                    fd.append("item_id", item.id);
                    fd.append("quantity", e.target.value);
                    fd.append("order_id", order?.id);

                    const res = await updateQty(fd);
                    if (res?.success) {
                      const newItems = [...orderItems];
                      newItems[index].quantity = e.target.value;
                      setOrderItems(newItems);
                    } else {
                      toast.error("Failed to update quantity");
                      e.target.value = item?.quantity || "";
                    }
                  } catch (err) {
                    toast.error("Failed to update quantity");
                    e.target.value = item?.quantity || "";
                  }
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Select
              onValueChange={async (value: string) => {
                const newItems = [...orderItems];
                newItems[index]["uom"] = value || "no_uom";
                setOrderItems(newItems);
                if (item?.id !== "no_item") {
                  try {
                    let res = await updateUoM(value, item?.id);
                  } catch (err) {}
                }
              }}
              defaultValue={item?.uom}
            >
              <SelectTrigger className="w-24 text-xs">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_uom" className="text-xs"></SelectItem>
                {products
                  .filter(
                    (obj: { id: string }) => obj.id === item?.commodity_id
                  )[0]
                  ?.quantity_unit_options?.map((option: any) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <Input
              type="text"
              defaultValue={item?.buying_price || ""}
              className="w-20 text-xs"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumberInput(e, item?.buying_price)
              }
              onBlur={async (e) => {
                if (
                  item?.id !== "no_item" &&
                  e.target.value !== item?.buying_price?.toString()
                ) {
                  try {
                    const fd = new FormData();
                    fd.append("item_id", item.id);
                    fd.append("buying_price", e.target.value);
                    fd.append("order_id", order?.id);

                    const res = await updateUnitCost(fd);
                    if (res?.success) {
                      const newItems = [...orderItems];
                      newItems[index].buying_price = e.target.value;
                      setOrderItems(newItems);
                    } else {
                      toast.error("Failed to update buying price");
                      e.target.value = item?.buying_price || "";
                    }
                  } catch (err) {
                    toast.error("Failed to update buying price");
                    e.target.value = item?.buying_price || "";
                  }
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Input
              type="text"
              defaultValue={item?.selling_price || ""}
              className="w-20 text-xs"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumberInput(e, item?.selling_price)
              }
              onBlur={async (e) => {
                if (
                  item?.id !== "no_item" &&
                  e.target.value !== item?.selling_price?.toString()
                ) {
                  try {
                    const fd = new FormData();
                    fd.append("item_id", item.id);
                    fd.append("selling_price", e.target.value);
                    fd.append("order_id", order?.id);

                    const res = await updateUnitPrice(fd);
                    if (res?.success) {
                      const newItems = [...orderItems];
                      newItems[index].selling_price = e.target.value;
                      setOrderItems(newItems);
                    } else {
                      toast.error("Failed to update selling price");
                      e.target.value = item?.selling_price || "";
                    }
                  } catch (err) {
                    toast.error("Failed to update selling price");
                    e.target.value = item?.selling_price || "";
                  }
                }
              }}
            />
          </TableCell>
          <TableCell className="text-xs">
            {calculateTotals(item).totalCost}
          </TableCell>
          <TableCell className="text-xs">
            {calculateTotals(item).totalPrice}
          </TableCell>
          <TableCell className="text-xs">
            {calculateTotals(item).profit}
          </TableCell>
          <TableCell className="text-xs">
            {calculateTotals(item).margin}
          </TableCell>
          {item.loading ? (
            <TableCell
              colSpan={9}
              className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-50"
            >
              <RowOverlay show={item.loading} />
            </TableCell>
          ) : (
            <TableCell className="w-10">
              {deleteLoadingMap[index] ? (
                <LoaderCircle
                  size={18}
                  key={index}
                  className="animate-spin text-red-700"
                />
              ) : (
                <Button
                  onClick={() => removeItemRow(index, item?.id)}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                >
                  <X className="text-red-700" />
                </Button>
              )}
            </TableCell>
          )}
        </TableRow>
      ))}
      <TableRow>
        <TableCell colSpan={9}>
          <Button type="button" onClick={addItemRow} variant="outline">
            Add Product
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
