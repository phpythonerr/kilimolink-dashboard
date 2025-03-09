"use client";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export default function SubmitButton({
  label,
  pending,
}: {
  label: string;
  pending: string;
}) {
  const status = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={status.pending}>
      {status.pending ? pending : label}
    </Button>
  );
}
