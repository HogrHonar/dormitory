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

export type AdminStudentRow = {
  id: string;
  studentCode: string;
  fullNameEn: string;
  fullNameKu: string;
  mobileNo: string;
  mobileNo2: string;
  department: {
    name: string;
  };
  floorNo: number;
  roomNo: number;
  email: string;
  entranceYear: {
    name: string;
  };
};

export const columns: ColumnDef<AdminStudentRow>[] = [
  {
    accessorKey: "studentCode",
    header: () => <div className="text-right">کۆد</div>,
  },
  {
    accessorKey: "fullNameKu",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-end"
      >
        ناو
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "mobileNo",
    header: () => <div className="text-right">مۆبایل</div>,
  },
  {
    accessorKey: "mobileNo2",
    header: () => <div className="text-right">بەخێوکەر</div>,
  },
  {
    accessorKey: "gender",
    header: () => <div className="text-right">ڕەگەز</div>,
  },
  {
    accessorFn: (row) => row.department.name,
    id: "department",
    header: () => <div className="text-right">بەش</div>,
  },
  {
    accessorKey: "entranceYear.name",
    header: () => <div className="text-right">ساڵی خوێندن</div>,
  },
  {
    accessorKey: "floorNo",
    header: () => <div className="text-right">نهۆم</div>,
  },
  {
    accessorKey: "roomNo",
    header: () => <div className="text-right">ژوور</div>,
  },
  {
    accessorKey: "email",
    header: () => <div className="text-right">ئیمەیڵ</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;

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
              onClick={() => navigator.clipboard.writeText(student.studentCode)}
            >
              کۆپی کۆد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
