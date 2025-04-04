"use client";

import { useState, useRef } from "react";
import {
  EllipsisVertical,
  ListCheck,
  CreditCard,
  Download,
  Trash2,
  Ellipsis,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import Invoice from "./invoice-pdf";
import DeliveryNote from "./delivery-note-pdf";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionButton({
  id,
  order_number,
  customer,
  items,
  revenue,
  bankAccount,
}: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Ellipsis />
          {/* <span>Actions</span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem key="delivery-note">
            <PDFDownloadLink
              document={
                <DeliveryNote
                  id={id}
                  order_number={order_number}
                  customer={customer}
                  items={items}
                />
              }
              fileName={`Kilimolink-DN#${order_number}.pdf`}
              className="w-full flex items-center"
            >
              {({ loading }) => {
                return (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>
                      {loading
                        ? "Preparing Delivery Note..."
                        : "Download Delivery Note"}
                    </span>
                  </>
                );
              }}
            </PDFDownloadLink>
          </DropdownMenuItem>
          <DropdownMenuItem key="invoice">
            <PDFDownloadLink
              document={
                <Invoice
                  id={id}
                  order_number={order_number}
                  customer={customer}
                  items={items}
                  revenue={revenue}
                  bankAccount={bankAccount}
                />
              }
              fileName={`Kilimolink-Inv#${order_number}.pdf`}
              className="w-full flex items-center"
            >
              {({ loading }) => {
                return (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>
                      {loading ? "Preparing Invoice..." : "Download Invoice"}
                    </span>
                  </>
                );
              }}
            </PDFDownloadLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
