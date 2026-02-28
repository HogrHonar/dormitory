"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type AdminStudentRow = {
  id: string;
  studentCode: string;
  fullNameEn: string;
  fullNameKu: string;
  mobileNo: string;
  mobileNo2: string;
  gender: string;
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
    cell: ({ row }) => {
      const student = row.original;

      return (
        <div className="text-right">
          <Link href={`/admin/students/${student.id}/payments`}>
            {student.studentCode}
          </Link>
        </div>
      );
    },
  },

  {
    accessorKey: "fullNameKu",
    header: () => <div className="text-right">ناو</div>,
    cell: ({ row }) => {
      const student = row.original;

      return (
        <div className="text-right">
          <Link href={`/admin/students/${student.id}/payments`}>
            {student.fullNameKu}
          </Link>
        </div>
      );
    },
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
    accessorFn: (row) => row.entranceYear.name,
    id: "entranceYear",
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
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>کردارەکان</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={`/admin/students/edit/${student.id}`}>
                  گۆڕانکاری
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                سڕینەوە
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(student.studentCode)
                }
              >
                کۆپی کۆد
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
