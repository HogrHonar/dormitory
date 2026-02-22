"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import { ExpenseFormValues } from "@/lib/zodSchemas";

import { useState } from "react";
import { createExpense } from "@/app/admin/expenses/expense-actions";

interface Category {
  id: string;
  name: string;
}

interface Dorm {
  id: string;
  title: string;
}

interface CreateExpenseDialogProps {
  categories: Category[];
  dorms: Dorm[];
}

export function CreateExpenseDialog({
  categories,
  dorms,
}: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: ExpenseFormValues) {
    return createExpense(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          زیادکردن
          <PlusIcon className="mr-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>زیادکردنی خەرجی نوێ</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          categories={categories}
          dorms={dorms}
          onSubmit={handleSubmit}
          onSuccess={() => setOpen(false)}
          submitLabel="زیادکردن"
        />
      </DialogContent>
    </Dialog>
  );
}
