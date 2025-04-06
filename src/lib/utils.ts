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

export const isWithinLastThreeDays = (dateStr: string) => {
  const itemDate = new Date(dateStr);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
  return itemDate >= threeDaysAgo;
};

export const fetchPaginatedData = async (query, pageSize, page) => {
  const { data: all, count } = await query;
  if (page && /^-?\d+$/.test(page)) {
    page = Number(page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  let { data, error } = await query;

  const pages = count && Math.ceil(count / pageSize);

  return {
    all,
    data,
    count,
    error,
    pages,
  };
};
