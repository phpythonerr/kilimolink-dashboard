import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value: string | number) => {
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

export const handleNumberInput = (
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
