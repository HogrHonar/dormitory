"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  approveOutgoingPaymentAction,
  rejectOutgoingPaymentAction,
  deleteOutgoingPaymentAction,
} from "./create/action";

export type OutgoingPaymentRow = {
  id: string;
  totalCollected: number;
  amountToHandOver: number;
  remainingFloat: number;
  note: string | null;
  paymentMethod: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedBy: string;
  submittedAt: Date;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionNote: string | null;
  createdAt: Date;
};

const statusBadge = (status: OutgoingPaymentRow["status"]) => {
  if (status === "APPROVED")
    return <Badge className="bg-green-600">پەسەندکراو</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive">ڕەتکراوەتەوە</Badge>;
  return <Badge variant="secondary">چاوەڕوان</Badge>;
};

const ActionsCell = ({ row }: { row: OutgoingPaymentRow }) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    const res = await approveOutgoingPaymentAction(row.id);
    if (res?.error) toast.error(res.error);
    else toast.success("داواکارییەکە پەسەندکرا");
    setIsLoading(false);
    router.refresh();
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error("تێبینی پێویستە");
      return;
    }
    setIsLoading(true);
    const res = await rejectOutgoingPaymentAction(row.id, rejectionNote);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("داواکارییەکە ڕەتکرایەوە");
      setShowRejectDialog(false);
    }
    setIsLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteOutgoingPaymentAction(row.id);
    if (res?.error) toast.error(res.error);
    else toast.success("داواکارییەکە سڕایەوە");
    setIsLoading(false);
    setShowDeleteDialog(false);
    router.refresh();
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

          {row.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={handleApprove} disabled={isLoading}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                پەسەندکردن
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowRejectDialog(true)}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                ڕەتکردنەوە
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                سڕینەوە
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.id)}
          >
            کۆپی کۆد
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>دڵنیای لە سڕینەوە؟</AlertDialogTitle>
            <AlertDialogDescription>
              ئەم داواکارییە بە هەمیشەیی دەسڕێتەوە.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>پاشگەزبوونەوە</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "سڕینەوە..." : "سڕینەوە"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ڕەتکردنەوەی داواکاری</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="هۆکاری ڕەتکردنەوە بنووسە..."
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              پاشگەزبوونەوە
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? "ڕەتکردنەوە..." : "ڕەتکردنەوە"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<OutgoingPaymentRow>[] = [
  {
    accessorKey: "status",
    header: () => <div className="text-right">دۆخ</div>,
    cell: ({ row }) => (
      <div className="text-right">{statusBadge(row.original.status)}</div>
    ),
    filterFn: (row, _, value) => {
      if (value === "all") return true;
      return row.original.status === value;
    },
  },
  {
    accessorKey: "totalCollected",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        کۆی کۆکراوە
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.totalCollected.toLocaleString()} IQD
      </div>
    ),
  },
  {
    accessorKey: "amountToHandOver",
    header: () => <div className="text-right">بڕی دراو بە ئەدمین</div>,
    cell: ({ row }) => (
      <div className="text-right font-bold text-blue-600">
        {row.original.amountToHandOver.toLocaleString()} IQD
      </div>
    ),
  },
  {
    accessorKey: "remainingFloat",
    header: () => <div className="text-right">ماوەی لای ژمێریار</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.remainingFloat.toLocaleString()} IQD
      </div>
    ),
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
    accessorKey: "note",
    header: () => <div className="text-right">تێبینی</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm text-muted-foreground">
        {row.original.note ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "rejectionNote",
    header: () => <div className="text-right">هۆکاری ڕەتکردنەوە</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm text-red-500">
        {row.original.rejectionNote ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex justify-end w-full"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ڕێکەوتی داواکاری
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {new Date(row.original.submittedAt).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row.original} />,
  },
];
