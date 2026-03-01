"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditLogRow } from "@/app/data/admin/admin-get-audit-logs";
import { AuditLogSheet } from "./audit-log-sheet";

const severityVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DEBUG: "secondary",
  INFO: "default",
  WARNING: "outline",
  ERROR: "destructive",
  CRITICAL: "destructive",
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  LOGIN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  LOGOUT: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  APPROVE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  REJECT:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ASSIGN_ROLE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

export const columns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ڕێکەوت
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleString("en-GB")}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: () => <div>کردار</div>,
    cell: ({ row }) => {
      const action = row.original.action;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[action] ?? "bg-gray-100 text-gray-800"}`}
        >
          {action}
        </span>
      );
    },
    filterFn: (row, _, value) =>
      value === "all" || row.original.action === value,
  },
  {
    accessorKey: "entityType",
    header: () => <div>جۆری تۆمار</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.entityType}</div>
    ),
    filterFn: (row, _, value) =>
      value === "all" || row.original.entityType === value,
  },
  {
    accessorKey: "description",
    header: () => <div>وەسف</div>,
    cell: ({ row }) => (
      <div className="max-w-sm truncate text-sm text-muted-foreground">
        {row.original.description ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "userEmail",
    header: () => <div>بەکارهێنەر</div>,
    cell: ({ row }) => (
      <div className="text-sm">{row.original.userEmail ?? "—"}</div>
    ),
  },
  {
    accessorKey: "severity",
    header: () => <div>ئاست</div>,
    cell: ({ row }) => (
      <Badge variant={severityVariant[row.original.severity] ?? "default"}>
        {row.original.severity}
      </Badge>
    ),
    filterFn: (row, _, value) =>
      value === "all" || row.original.severity === value,
  },
  {
    id: "actions",
    cell: ({ row }) => <AuditLogSheet log={row.original} />,
  },
];
