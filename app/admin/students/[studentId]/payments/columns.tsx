// app/admin/students/[studentId]/payments/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentPayment } from "@/app/data/admin/admin-get-student-payments";

const paymentTypeLabels: Record<string, string> = {
  RECEIVE: "وەرگرتن",
  RETURN: "گەڕانەوە",
  DISCOUNT: "داشکاندن",
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "کاش",
  FIB: "فایب",
  FASTPAY: "فاستپەی",
};

export const columns: ColumnDef<StudentPayment>[] = [
  {
    accessorKey: "paidAt",
    header: "ڕێکەوت",
    cell: ({ row }) =>
      new Date(row.original.paidAt).toLocaleDateString("ar-IQ"),
  },
  {
    accessorKey: "installment",
    header: "کرێ",
    cell: ({ row }) => (
      <div className="text-right">
        <p className="font-medium">{row.original.installment.title}</p>
        <p className="text-sm text-muted-foreground">
          کرێی {row.original.installment.installmentNo}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "بڕی پارە",
    cell: ({ row }) => {
      const type = row.original.paymentType;
      const color =
        type === "RECEIVE"
          ? "text-green-600"
          : type === "RETURN"
            ? "text-red-600"
            : "text-blue-600";
      return (
        <span className={`font-semibold ${color}`}>
          ${row.original.amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "paymentType",
    header: "جۆری پارەدان",
    cell: ({ row }) => {
      const type = row.original.paymentType;
      const variant =
        type === "RECEIVE"
          ? "default"
          : type === "RETURN"
            ? "destructive"
            : "secondary";
      return <Badge variant={variant}>{paymentTypeLabels[type]}</Badge>;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "شێوازی پارەدان",
    cell: ({ row }) => (
      <Badge variant="outline">
        {paymentMethodLabels[row.original.paymentMethod]}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "کردارەکان",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>گۆڕانکاری</DropdownMenuLabel>
            <DropdownMenuItem>دەستکاری</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              سڕینەوە
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              کۆپی کۆد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
