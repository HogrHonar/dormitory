"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/app/admin/expenses/expense-actions";

interface DeleteExpenseDialogProps {
  expenseId: string;
  expenseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteExpenseDialog({
  expenseId,
  expenseTitle,
  open,
  onOpenChange,
}: DeleteExpenseDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExpense(expenseId);
      if (result.success) {
        toast.success("خەرجییەکە سڕایەوە");
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "هەڵەیەک ڕوویدا");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>دڵنیای لە سڕینەوە؟</AlertDialogTitle>
          <AlertDialogDescription>
            ئایا دڵنیایت کە دەتەوێت{" "}
            <span className="font-semibold text-foreground">
              {expenseTitle}
            </span>{" "}
            بسڕیتەوە؟ ئەم کارە گەرانەوەی نییە.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2 sm:justify-start">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "چاوەڕوانبە..." : "سڕینەوە"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isPending}>
            هەڵوەشاندنەوە
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
