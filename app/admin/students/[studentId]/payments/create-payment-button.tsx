// app/admin/students/[studentId]/payments/create-payment-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreatePaymentModal } from "./create-payment-modal";

interface Installment {
  id: string;
  title: string;
  installmentNo: number;
  amount: number;
  paid: number;
  remaining: number;
  isFullyPaid: boolean;
}

interface CreatePaymentButtonProps {
  studentId: string;
  installments: Installment[];
}

export function CreatePaymentButton({
  studentId,
  installments,
}: CreatePaymentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="ml-2 h-4 w-4" />
        زیادکردنی وەسڵ
      </Button>

      <CreatePaymentModal
        open={open}
        onOpenChange={setOpen}
        studentId={studentId}
        installments={installments}
      />
    </>
  );
}
