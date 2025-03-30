"use client";
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateUnitCost } from "./actions";
import Link from "next/link";

export default function ItemTableRow({ item, date }: any) {
  let [price, setPrice] = useState<number>(item?.buying_price);

  const formatNumber = (value: string | number) => {
    if (!value) return "";

    // Remove all non-numeric characters except decimal point
    const cleaned = value.toString().replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    return cleaned;
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentValue: string
  ) => {
    let formatted = formatNumber(e.target.value);

    // Handle special cases
    if (formatted === ".") {
      e.target.value = "0.";
      return;
    }

    if (formatted === "") {
      e.target.value = "";
      return;
    }

    // Handle decimal places
    const parts = formatted.split(".");
    if (parts[1]?.length > 2) {
      // Limit to 2 decimal places
      formatted = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setPrice(Number(formatted));

    e.target.value = formatted;
  };

  return (
    <TableRow>
      <TableCell>
        <Link
          className="text-primary"
          href={`/store/products/view?id=${item?.commodity_id}`}
        >
          {item?.name}
        </Link>
      </TableCell>
      <TableCell>{`${item?.total_quantity} ${item?.quantity_unit}`}</TableCell>
      <TableCell>
        <Input
          type="text"
          defaultValue={price || 0}
          className={`w-20 text-xs ${
            item?.id === "no_item" && "cursor-not-allowed"
          }`}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleNumberInput(e, price)
          }
          onBlur={async (e) => {
            // if (e.target.value !== price.toString()) {
            try {
              const fd = new FormData();
              fd.append("buying_price", e.target.value);
              fd.append("delivery_date", date);
              fd.append("commodity_id", item?.commodity_id);
              const res = await updateUnitCost(fd);
              if (res?.success) {
                toast.success(
                  `Price of ${item?.name} updated to Ksh.${price} per unit`
                );
              } else {
                toast.error(res?.error);
              }
            } catch (err) {
              toast.error(JSON.stringify(err));
            }
            // }
          }}
        />
      </TableCell>
      <TableCell>{Number(item?.selling_price).toFixed(2)}</TableCell>
      <TableCell>{`${Number(
        ((item?.selling_price - price) / item?.selling_price) * 100
      ).toFixed(2)}%`}</TableCell>
    </TableRow>
  );
}
