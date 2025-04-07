"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, Share } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PaymentVoucherPDF from "./payment-voucher-pdf";
import { toast } from "sonner";

interface PaymentSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
}

export function PaymentSummaryDialog({
  open,
  onOpenChange,
  paymentId,
}: PaymentSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment Summary</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <PDFDownloadLink
            document={<PaymentVoucherPDF />}
            fileName={`Payment-Voucher.pdf`}
            className="flex items-center justify-center bg-primary border border-green-900 dark:border-green-600 rounded h-8"
          >
            {({ loading }) => {
              return (
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4 mr-2 text-white" />
                  <span className="text-white">
                    {loading ? "Preparing PDF..." : "Download PDF"}
                  </span>
                </div>
              );
            }}
          </PDFDownloadLink>
          {/* <Button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button> */}
          {/* <Button
            variant="outline"
            disabled={true}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send via Email
            <span className="ml-auto text-xs text-muted-foreground">
              (Coming soon)
            </span>
          </Button>
          <Button
            variant="outline"
            disabled={true}
            className="flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share via WhatsApp
            <span className="ml-auto text-xs text-muted-foreground">
              (Coming soon)
            </span>
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
