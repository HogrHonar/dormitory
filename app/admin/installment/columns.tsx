"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminInstallmentRow = {
  id: string;
  title: string;
  installmentNo: number;
  amount: number;
  startDate: Date;
  endDate: Date;
  entranceYear: {
    name: string;
  };
  year: {
    name: string;
  };
};

export const columns: ColumnDef<AdminInstallmentRow>[] = [
  {
    accessorKey: "installmentNo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ژمارە
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "Year",
    header: () => <div className="text-right">ساڵ</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.year.name}</div>
    ),
  },
  {
    accessorKey: "title",
    header: () => <div className="text-right">ناونیشان</div>,
  },
  {
    accessorKey: "entranceYear",
    header: () => <div className="text-right">ساڵی دەستپێکردنی فێرخواز</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.entranceYear.name}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">بڕی پارە</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.amount.toLocaleString()} هەزار
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: () => <div className="text-right">دەستپێک</div>,
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: () => <div className="text-right">کۆتایی</div>,
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const installment = row.original;

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
              onClick={() => navigator.clipboard.writeText(installment.id)}
            >
              کۆپی کۆد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
