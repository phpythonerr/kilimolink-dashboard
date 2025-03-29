import { SalesChart } from "./chart";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  let { data, error: last30DaysError }: any = await supabase.rpc(
    "get_selling_buying_report_last_30_days_v2"
  );

  return <SalesChart data={data || []} />;
}
