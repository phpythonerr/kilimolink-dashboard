import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type DbOperation = {
  table: string;
  operation: "select" | "insert" | "update" | "delete";
  data?: any;
  where?: Record<string, any>;
  select?: string;
};

export async function handleDbOperation({
  table,
  operation,
  data,
  where,
  select = "*",
}: DbOperation) {
  const supabase = await createClient();

  try {
    let query = supabase.from(table);

    switch (operation) {
      case "select":
        query = query.select(select);
        break;
      case "insert":
        query = query.insert(data).select(select);
        break;
      case "update":
        query = query.update(data).select(select);
        break;
      case "delete":
        query = query.delete();
        break;
    }

    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data: result, error } = await query;

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Operation failed",
    };
  }
}
