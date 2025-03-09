import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Individual Order",
  description: "",
};

export default function Index() {
  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-3">
      <div className="flex-1 flex justify-end items-end"></div>
    </div>
  );
}
