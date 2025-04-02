"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LocationFilter({ users }: { users: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get unique locations
  const locations = Array.from(
    new Set(
      users
        .map((user) => user.user_metadata?.location)
        .filter(
          (location): location is string =>
            typeof location === "string" && location.length > 0
        )
    )
  ).sort();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <Select
      defaultValue={searchParams.get("location") || ""}
      onValueChange={(value) => {
        router.push(pathname + "?" + createQueryString("location", value));
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by location" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Locations</SelectItem>
        {locations.map((location: any, index: number) => (
          <SelectItem key={index} value={location}>
            {location}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
