import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Business performance overview",
};

export default function Layout({
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
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenue}
        {profits}
        {saleslast30days}
        {orders}
      </div>

      {/* Sales Chart */}
      <div>{saleschart}</div>

      {/* Additional Content */}
    </div>
  );
}
