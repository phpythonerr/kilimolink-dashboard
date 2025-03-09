import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product, OrderItem } from "../types";

interface ProductSelectorProps {
  product: Product;
  item: OrderItem;
  products: Product[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => Promise<void>;
}

export function ProductSelector({
  product,
  item,
  products,
  isOpen,
  onOpenChange,
  onSelect,
}: ProductSelectorProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-48 justify-between text-xs"
        >
          {item.commodity_id ? product?.name : "Select Product"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search Product..." className="h-9" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => onSelect(p)}
                >
                  {p.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      p.id === item.commodity_id ? "opacity-100" : "opacity-0"
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
