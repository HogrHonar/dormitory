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

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type AdminFeeRow = {
  id: string;
  entranceYear: string;
  totalAmount: number;
  department: {
    name: string;
  };
};

export const columns: ColumnDef<AdminFeeRow>[] = [
  {
    accessorKey: "entranceYear",
    header: () => <div className="text-right">ساڵی خوێندن</div>,
  },
  {
    accessorFn: (row) => row.department.name,
    id: "department",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-end"
      >
        بەش
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">کۆی گشتی</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>گۆڕانکاری</DropdownMenuLabel>
            <DropdownMenuLabel>سڕینەوە</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(fee.id)}
            >
              کۆپی کۆد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
