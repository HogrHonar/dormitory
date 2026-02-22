"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { deleteRoomAction } from "./create/action";
import { useState } from "react";

export type AdminRoomRow = {
  id: string;
  floorNumber: number;
  roomNumber: number;
  capacity: number;
  createdAt: Date;
  dormitory: {
    id: string;
    title: string;
  };
  _count: {
    students: number;
  };
};

const ActionsCell = ({ room }: { room: AdminRoomRow }) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteRoomAction(room.id);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("ژوور بە سەرکەوتوویی سڕایەوە");
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
            onClick={() => router.push(`/admin/room/${room.id}/edit`)}
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
            onClick={() => navigator.clipboard.writeText(room.id)}
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
              ئەم کردارە ناگەڕێتەوە. ئەمە بە هەمیشەیی ژوورەکە دەسڕێتەوە.
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

export const columns: ColumnDef<AdminRoomRow>[] = [
  {
    accessorKey: "dormitory",
    header: () => <div className="text-right">نوێخانە</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.dormitory.title}
      </div>
    ),
    filterFn: (row, id, value) => {
      return row.original.dormitory.title.includes(value);
    },
  },
  {
    accessorKey: "floorNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        نهۆم
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.floorNumber}</div>
    ),
  },
  {
    accessorKey: "roomNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ژمارەی ژوور
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-bold">{row.original.roomNumber}</div>
    ),
  },
  {
    accessorKey: "capacity",
    header: () => <div className="text-right">بەرزترین ژمارە</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.capacity}</div>
    ),
  },
  {
    accessorKey: "students",
    header: () => <div className="text-right">فێرخوازەکان</div>,
    cell: ({ row }) => {
      const studentCount = row.original._count.students;
      const capacity = row.original.capacity;
      const isFull = studentCount >= capacity;
      const isEmpty = studentCount === 0;

      return (
        <div className="text-right flex justify-end">
          <Badge
            variant={isFull ? "destructive" : isEmpty ? "secondary" : "default"}
          >
            {studentCount} / {capacity}
          </Badge>
        </div>
      );
    },
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
    cell: ({ row }) => <ActionsCell room={row.original} />,
  },
];
