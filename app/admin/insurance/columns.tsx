"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteInsuranceAction } from "./create/action";

export type InsuranceStatus = "ACTIVE" | "RETURNED" | "FORFEITED";

export type AdminInsuranceRow = {
  id: string;
  amountPaid: number;
  amountReturned: number | null;
  returnNote: string | null;
  returnedAt: Date | null;
  returnedBy: string | null;
  paymentMethod: "CASH" | "FIB" | "FASTPAY";
  status: InsuranceStatus;
  paidAt: Date;
  createdAt: Date;
  student: {
    id: string;
    studentCode: string;
    fullNameKu: string;
    fullNameEn: string;
  };
};

const statusConfig: Record<
  InsuranceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  ACTIVE: { label: "چالاک", variant: "default" },
  RETURNED: { label: "گەڕاندنەوە", variant: "secondary" },
  FORFEITED: { label: "لەدەستدراو", variant: "destructive" },
};

const ActionsCell = ({ insurance }: { insurance: AdminInsuranceRow }) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteInsuranceAction(insurance.id);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("بارمتە بە سەرکەوتوویی سڕایەوە");
      router.refresh();
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>گۆڕانکاری</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/insurance/${insurance.id}/edit`)}
          >
            دەستکاری
          </DropdownMenuItem>
          {insurance.status === "ACTIVE" && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/admin/insurance/${insurance.id}/return`)
              }
            >
              گەڕاندنەوەی بارمتە
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            سڕینەوە
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(insurance.id)}
          >
            کۆپی کۆد
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>دڵنیای لە سڕینەوە؟</AlertDialogTitle>
            <AlertDialogDescription>
              ئەم کردارە ناگەڕێتەوە. ئەمە بە هەمیشەیی تۆمارە بارمتەکە دەسڕێتەوە.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "سڕینەوە..." : "سڕینەوە"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns: ColumnDef<AdminInsuranceRow>[] = [
  {
    accessorKey: "student",
    header: () => <div className="text-right">فێرخواز</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <p className="font-medium">{row.original.student.fullNameKu}</p>
        <p className="text-sm text-muted-foreground">
          {row.original.student.studentCode}
        </p>
      </div>
    ),
    filterFn: (row, _id, value) => {
      const s = row.original.student;
      return (
        s.fullNameKu.includes(value) ||
        s.fullNameEn.toLowerCase().includes(value.toLowerCase()) ||
        s.studentCode.includes(value)
      );
    },
  },
  {
    accessorKey: "amountPaid",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        بڕی پارەی بارمتە
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-bold">
        {row.original.amountPaid.toLocaleString()} IQD
      </div>
    ),
  },
  {
    accessorKey: "amountReturned",
    header: () => <div className="text-right">بڕی گەڕاندنەوە</div>,
    cell: ({ row }) => {
      const returned = row.original.amountReturned;
      if (returned === null)
        return <div className="text-right text-muted-foreground">—</div>;
      const deduction = row.original.amountPaid - returned;
      return (
        <div className="text-right">
          <p className="font-medium">{returned.toLocaleString()} IQD</p>
          {deduction > 0 && (
            <p className="text-sm text-red-500">
              -{deduction.toLocaleString()} IQD
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: () => <div className="text-right">شێوازی پارەدان</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="outline">{row.original.paymentMethod}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right">دۆخ</div>,
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status];
      return (
        <div className="text-right flex justify-end">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      if (!value || value === "all") return true;
      return row.original.status === value;
    },
  },
  {
    accessorKey: "paidAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ڕێکەوت
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.original.paidAt).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell insurance={row.original} />,
  },
];
