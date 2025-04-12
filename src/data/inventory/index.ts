import { createClient } from "@/lib/supabase/server";

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  last_updated: string;
}

export interface InventoryLedgerItem {
  id?: string;
  inventory_id?: string;
  product_id?: string;
  uom?: string;
  transaction_type?: string;
  notes?: string;
  change_quantity?: number;
  transaction_date?: any;
}

export async function getInventoryItems(
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = ""
) {
  const supabase = await createClient();

  // Calculate the range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Build the query
  let query = supabase.from("inventory_commodity").select(
    `
      id,
      products:id (name),
      quantity,
      uom,
      last_updated
    `,
    { count: "exact" }
  );

  // Apply search filter if provided
  if (searchQuery) {
    query = query
      .or(`products.name.ilike.%${searchQuery}%`)
      .order("last_updated", { ascending: false });
  } else {
    query = query.order("last_updated", { ascending: false });
  }

  // Apply pagination
  const { data, count, error } = await query.range(start, end);

  if (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }

  // Transform the data to match the expected interface
  const items: any =
    data?.map((item: any) => ({
      id: item.id,
      product_name: item.products?.name || "Unknown Product",
      quantity: item.quantity,
      unit: item.uom,
      last_updated: item.last_updated,
    })) || [];

  return {
    items,
    totalCount: count || 0,
    pageCount: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  };
}

export async function getInventoryLedger(
  inventoryId: string,
  page: number = 1,
  pageSize: number = 10
) {
  const supabase = await createClient();

  // Calculate the range for pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // First, get the product_id for this inventory item
  const { data: inventoryData, error: inventoryError }: any = await supabase
    .from("inventory_commodity")
    .select("id, products:id (name)")
    .eq("id", inventoryId)
    .single();

  if (inventoryError) {
    console.error("Error fetching inventory item:", inventoryError);
    throw inventoryError;
  }

  // Then, get the ledger entries
  const {
    data: ledgerData,
    count,
    error,
  } = await supabase
    .from("inventory_ledger")
    .select("*", { count: "exact" })
    .eq("commodity_id", inventoryId)
    .order("transaction_date", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching inventory ledger:", error);
    throw error;
  }

  return {
    items: ledgerData || [],
    productId: inventoryId,
    productName: inventoryData?.products[0]?.name || "Unknown Product",
    totalCount: count || 0,
    pageCount: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  };
}
