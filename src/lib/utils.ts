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

export async function fetchPaginatedData(
  query: any,
  pageSize: number,
  page: number
) {
  try {
    // Get all data for summary calculations
    const { data: allData, error: allError } = await query;

    // Calculate correct start and end indices for pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Get paginated data with corrected range
    const { data: pagedData, count, error } = await query.range(start, end);

    if (error || allError) throw error || allError;

    const pages = count ? Math.ceil(count / pageSize) : 0;

    return {
      all: allData || [],
      data: pagedData || [],
      count,
      error: null,
      pages,
    };
  } catch (error) {
    console.error("Error fetching paginated data:", error);
    return {
      all: [],
      data: [],
      count: 0,
      error,
      pages: 0,
    };
  }
}
