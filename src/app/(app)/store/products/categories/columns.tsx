"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Define your data type
export interface RevenuesInterface {
  name: string;
}

// Define your columns
export const columns: ColumnDef<RevenuesInterface>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 400,
    cell: ({ row }) => {
      const image = row.original.image;
      const id = row.original.id;
      const name = row.getValue("name");
      return (
        <div className="w-10">
          <Link href={`/store/products?category=${id}`}>
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
];
