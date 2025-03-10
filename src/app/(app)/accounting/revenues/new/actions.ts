export async function createRevenue(formData: any) {
  let supabase = await createClient();

  const {
    data: { user: me },
  }: any = await supabase.auth.getUser();
  if (me?.user_metadata?.permissions.includes("can_create_expense")) {
    let { data, error }: any = await supabase.from("finance_revenue").insert({
      revenue_type_id: formData.get("revenue_type"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      reference: formData.get("reference"),
      invoiceable: formData.get("invoiceable"),
      vat_rule: formData.get("vat_rule") || null,
      order_id: orderID,
      description: formData.get("description"),
    });

    if (error) {
      return { success: false, error: error };
    } else {
      return { success: true };
    }
  } else {
    return {
      success: false,
      error: "Permission Error",
    };
  }
}
