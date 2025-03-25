import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ItemTableRow({ items }: any) {
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

    e.target.value = formatted;
  };

  return (
    <TableBody>
      {items?.map((item: any, index: any) => (
        <TableRow key={item?.commodity_id + index}>
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
              defaultValue={item?.buying_price || ""}
              className={`w-20 text-xs ${
                item?.id === "no_item" && "cursor-not-allowed"
              }`}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNumberInput(e, item?.buying_price)
              }
              onBlur={async (e) => {}}
            />
          </TableCell>
          <TableCell>{Number(item?.selling_price).toFixed(2)}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
