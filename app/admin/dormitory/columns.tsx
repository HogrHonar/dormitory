"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { deleteDormitoryAction } from "./create/action";
import { useState } from "react";

export type AdminDormitoryRow = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  manager: {
    id: string;
    name: string;
  } | null;
  _count: {
    rooms: number;
  };
};

const ActionsCell = ({ dormitory }: { dormitory: AdminDormitoryRow }) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteDormitoryAction(dormitory.id);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("بەشە ناوخۆیی بە سەرکەوتوویی سڕایەوە");
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
            onClick={() => router.push(`/admin/dormitory/${dormitory.id}/edit`)}
          >
            دەستکاری
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            سڕینەوە
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(dormitory.id)}
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
              ئەم کردارە ناگەڕێتەوە. ئەمە بە هەمیشەیی بەشە ناوخۆییکە دەسڕێتەوە.
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

export const columns: ColumnDef<AdminDormitoryRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ناونیشان
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "manager",
    header: () => <div className="text-right">بەڕێوەبەر</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.manager?.name || "هیچ بەڕێوەبەرێک"}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: () => <div className="text-right">وەسف</div>,
    cell: ({ row }) => (
      <div className="text-right max-w-md truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "rooms",
    header: () => <div className="text-right">ژمارەی ژوورەکان</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original._count.rooms}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">ڕێکەوت</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.original.createdAt).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell dormitory={row.original} />,
  },
];
