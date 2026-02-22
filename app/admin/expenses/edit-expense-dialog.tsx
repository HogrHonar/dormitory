"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm, ExpenseFormValues } from "./expense-form";
import { updateExpense } from "@/app/admin/expenses/expense-actions";
import { AdminExpenseRow } from "./columns";

interface Category {
  id: string;
  name: string;
}

interface Dorm {
  id: string;
  title: string;
}

interface EditExpenseDialogProps {
  expense: AdminExpenseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: Category[];
  dorms?: Dorm[];
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  categories: categoriesProp,
  dorms: dormsProp,
}: EditExpenseDialogProps) {
  const [categories, setCategories] = useState<Category[]>(
    categoriesProp ?? [],
  );
  const [dorms, setDorms] = useState<Dorm[]>(dormsProp ?? []);

  useEffect(() => {
    if (!open) return;
    if (categories.length > 0 && dorms.length > 0) return;

    fetch("/api/expense-form-data")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setDorms(data.dorms ?? []);
      });
  }, [open]);

  async function handleSubmit(values: ExpenseFormValues) {
    return updateExpense(expense.id, values);
  }

  const defaultValues: Partial<ExpenseFormValues> = {
    title: expense.title,
    amount: expense.amount,
    description: expense.description ?? "",
    date: new Date(expense.date),
    documentUrl: expense.documentUrl ?? "",
    categoryId: expense.categoryId,
    dormId: expense.dormId ?? "NO_DORM",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle>دەستکاریکردنی خەرجی</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          defaultValues={defaultValues}
          categories={categories}
          dorms={dorms}
          onSubmit={handleSubmit}
          onSuccess={() => onOpenChange(false)}
          submitLabel="پاشەکەوتکردن"
        />
      </DialogContent>
    </Dialog>
  );
}
