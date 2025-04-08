"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface User {
  id: string;
  user_metadata?: {
    business_name?: string;
  };
}

export function UserFilter({ users }: { users: User[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const currentValue = searchParams.get("customer") || "";
  const currentUser = users.find((user: any) => user.id === currentValue);

  if (!users?.length) return null;

  const filteredUsers = users.filter((user: any) =>
    user.user_metadata?.business_name
      ?.toLowerCase()
      .includes(inputValue.toLowerCase())
  );

  const onSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== currentValue) {
      params.set("customer", value);
    } else {
      params.delete("customer");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {currentUser?.user_metadata?.business_name || "Select customer..."}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput
            placeholder="Search customer..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelect("");
                  setInputValue("");
                }}
              >
                <span>All Customers</span>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    !currentValue ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {filteredUsers.map((user: any) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    onSelect(user.id);
                    setInputValue("");
                  }}
                >
                  {user.user_metadata?.business_name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentValue === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
