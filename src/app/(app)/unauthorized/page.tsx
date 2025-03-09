import React from "react";
import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized - You do not have access to this page",
  description: "",
};

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex-1 h-full flex flex-col gap-4 items-center justify-center">
      <TriangleAlert size={44} className="text-red-800 text-lg" />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-red-800 font-bold">Unauthorized</h1>
        <p className="text-sm text-red-900">
          You do not have access to this page.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
