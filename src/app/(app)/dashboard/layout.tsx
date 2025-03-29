import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "",
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          {revenue}
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          {profits}
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          {orders}
        </div>
      </div> */}
      <div className="rounded-xl border bg-card text-card-foreground p-6">
        {saleschart}
      </div>
    </div>
  );
}
