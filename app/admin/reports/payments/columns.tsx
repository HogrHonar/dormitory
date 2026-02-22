"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentRow } from "@/app/data/admin/reports/admin-get-paymentreport";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatAmount(n: number) {
  return n.toLocaleString("ku");
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ku");
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PAID: { label: "پارەدراو", variant: "default" },
  NOT_PAID: { label: "پارەنەدراو", variant: "destructive" },
  PARTIALLY_PAID: { label: "بەشێک پارەدراو", variant: "secondary" },
};

/* ------------------------------------------------------------------ */
/*  Column definitions                                                  */
/* ------------------------------------------------------------------ */

export const columns: ColumnDef<PaymentRow>[] = [
  /* 1 — Row index (visual only) */
  {
    id: "index",
    header: () => <div className="text-right">#</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },

  /* 2 — Student code */
  {
    accessorKey: "student.studentCode",
    id: "studentCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full justify-end"
      >
        کۆدی فێرخواز
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.student.studentCode}
      </div>
    ),
  },

  /* 3 — Student name */
  {
    accessorKey: "student.fullNameKu",
    id: "fullNameKu",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full justify-end"
      >
        ناوی فێرخواز
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.student.fullNameKu}
      </div>
    ),
  },

  /* 4 — Department */
  {
    accessorKey: "student.department.name",
    id: "department",
    header: () => <div className="text-right">بەش</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.student.department.name}</div>
    ),
  },

  /* 5 — Installment title / no */
  {
    accessorKey: "installment.installmentNo",
    id: "installmentNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full justify-end"
      >
        قیست
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <span className="font-medium">{row.original.installment.title}</span>
        <span className="ml-1 text-xs text-muted-foreground">
          (#{row.original.installment.installmentNo})
        </span>
      </div>
    ),
  },

  /* 6 — Total installment amount */
  {
    accessorKey: "installment.amount",
    id: "amount",
    header: () => <div className="text-right">کۆی قیست</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {formatAmount(row.original.installment.amount)}
      </div>
    ),
  },

  /* 7 — Paid */
  {
    accessorKey: "paid",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full justify-end"
      >
        پارەدراو
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right text-green-700 dark:text-green-400">
        {formatAmount(row.original.paid)}
      </div>
    ),
  },

  /* 8 — Discount */
  {
    accessorKey: "discount",
    header: () => <div className="text-right">داشکاندن</div>,
    cell: ({ row }) => (
      <div className="text-right text-blue-700 dark:text-blue-400">
        {formatAmount(row.original.discount)}
      </div>
    ),
  },

  /* 9 — Returned */
  {
    accessorKey: "returned",
    header: () => <div className="text-right">گەڕاوە</div>,
    cell: ({ row }) => (
      <div className="text-right text-orange-600 dark:text-orange-400">
        {formatAmount(row.original.returned)}
      </div>
    ),
  },

  /* 10 — Remaining */
  {
    accessorKey: "remaining",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex w-full justify-end"
      >
        ماوە
        <ArrowUpDown className="mr-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div
        className={`text-right font-semibold ${
          row.original.remaining > 0
            ? "text-red-600 dark:text-red-400"
            : "text-green-700 dark:text-green-400"
        }`}
      >
        {formatAmount(row.original.remaining)}
      </div>
    ),
  },

  /* 11 — Payment status */
  {
    accessorKey: "paymentStatus",
    id: "paymentStatus",
    header: () => <div className="text-right">دۆخ</div>,
    cell: ({ row }) => {
      const status = row.original.paymentStatus ?? "NOT_PAID";
      const config = STATUS_MAP[status] ?? {
        label: status,
        variant: "outline" as const,
      };
      return (
        <div className="flex justify-end">
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    },
  },

  /* 12 — Last paid at */
  {
    accessorKey: "lastPaidAt",
    id: "lastPaidAt",
    header: () => <div className="text-right">کۆتا پارەدان</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm text-muted-foreground">
        {formatDate(row.original.lastPaidAt)}
      </div>
    ),
  },
];
