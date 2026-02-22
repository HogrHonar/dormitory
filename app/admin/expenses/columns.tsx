"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteExpenseDialog } from "./delete-expense-dialog";
import { EditExpenseDialog } from "./edit-expense-dialog";
import { useState } from "react";

export type AdminExpenseRow = {
  id: string;
  title: string;
  amount: number;
  description: string | null;
  date: Date;
  documentUrl: string | null;
  categoryId: string;
  category: { id: string; name: string };
  dormId: string | null;
  dorm: { id: string; title: string } | null;
};

function ActionsCell({ row }: { row: { original: AdminExpenseRow } }) {
  const expense = row.original;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <EditExpenseDialog
        expense={expense}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteExpenseDialog
        expenseId={expense.id}
        expenseTitle={expense.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">کردنەوەی مێنیو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>کارەکان</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            دەستکاریکردن
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            سڕینەوە
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export const columns: ColumnDef<AdminExpenseRow>[] = [
  {
    accessorKey: "title",
    header: () => <div className="text-right">ناونیشان</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorFn: (row) => row.category.name,
    id: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-start w-full"
      >
        جۆر
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.category.name}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-start w-full"
      >
        بڕی پارە
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {(row.getValue("amount") as number).toLocaleString()} د.ع
      </div>
    ),
  },
  {
    accessorFn: (row) => row.dorm?.title ?? "-",
    id: "dorm",
    header: () => <div className="text-right">بەشە ناوخۆیی</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.dorm?.title ?? "-"}</div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">ڕێکەوت</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.getValue("date")).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
