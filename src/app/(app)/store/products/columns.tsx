"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface ProductInterface {
  id: string;
  name: string;
  image: string;
  quantity_unit: string;
}

// Define your columns
export const columns: ColumnDef<ProductInterface>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 400,
    cell: ({ row }) => {
      const { image, id, name } = row.original;
      return (
        <div className="w-10">
          <Link href={`/store/products/view?id=${id}`}>
            <div className="flex gap-2 text-primary">
              {/* <AspectRatio ratio={16 / 9}>
              <Image
                src={image}
                alt={name}
                className="rounded-md"
                width={16}
                height={9}
              />
            </AspectRatio> */}
              <span>{name}</span>
            </div>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity_unit",
    header: "Default UoM",
    cell: ({ row }) => {
      const uom = row.getValue("quantity_unit");
      return uom;
    },
  },
];
