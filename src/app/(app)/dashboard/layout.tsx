import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserPermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Business performance overview",
};

export default async function Layout({
  children,
  saleschart,
  revenue,
  profits,
  orders,
  saleslast30days,
}: {
  children: React.ReactNode;
  saleschart: React.ReactNode;
  revenue: React.ReactNode;
  profits: React.ReactNode;
  orders: React.ReactNode;
  saleslast30days: React.ReactNode;
}) {
  // Check if user has access to dashboard components
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const userPermissions = await getUserPermissions(user.id);
  const permissionNames = userPermissions.map((p) => p.name);

  // Define which permissions are needed for each component
  const hasRevenueAccess = permissionNames.includes(
    "reports.accounting.revenues.view"
  );
  const hasProfitsAccess = permissionNames.includes(
    "reports.accounting.profit-loss.view"
  );
  const hasSalesAccess =
    permissionNames.includes("reports.orders.corporate.view") ||
    permissionNames.includes("reports.orders.vendors.view") ||
    permissionNames.includes("reports.orders.individual.view");
  const hasOrdersAccess =
    permissionNames.includes("orders.corporate.view") ||
    permissionNames.includes("orders.individual.view") ||
    permissionNames.includes("orders.vendors.view");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasRevenueAccess ? revenue : null}
        {hasProfitsAccess ? profits : null}
        {hasSalesAccess ? saleslast30days : null}
        {hasOrdersAccess ? orders : null}
      </div>

      {/* Sales Chart */}
      <div>{hasSalesAccess ? saleschart : null}</div>

      {/* Additional Content */}
      {children}
    </div>
  );
}
