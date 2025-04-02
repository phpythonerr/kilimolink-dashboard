"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  user_metadata?: {
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    tradeName?: string;
  };
}

export function SellerFilter({ users }: { users: User[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const getUserDisplayName = (user: User) => {
    const metadata = user.user_metadata || {};
    const firstName = metadata.firstName || metadata.first_name || "";
    const lastName = metadata.lastName || metadata.last_name || "";
    const tradeName = metadata.tradeName;

    return (
      `${firstName} ${lastName} ${tradeName && `(${tradeName})`}`.trim() ||
      "Unknown User"
    );
  };

  return (
    <Select
      defaultValue={searchParams.get("seller") || ""}
      onValueChange={(value) => {
        router.push(pathname + "?" + createQueryString("seller", value));
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by Seller" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Sellers</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {getUserDisplayName(user)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
