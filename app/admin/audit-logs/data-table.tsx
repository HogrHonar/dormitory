"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditLogRow } from "@/app/data/admin/admin-get-audit-logs";

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "APPROVE",
  "REJECT",
  "ASSIGN_ROLE",
  "REVOKE_ROLE",
  "BULK_OPERATION",
  "EXPORT",
  "IMPORT",
  "SETTINGS_CHANGE",
  "SYSTEM",
];
const SEVERITIES = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const entityTypes = React.useMemo(() => {
    const types = new Set((data as AuditLogRow[]).map((r) => r.entityType));
    return Array.from(types).sort();
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="گەڕان بە ئیمێڵ..."
          value={
            (table.getColumn("userEmail")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("userEmail")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />

        <Select
          value={
            (table.getColumn("action")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(v) =>
            table.getColumn("action")?.setFilterValue(v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="هەموو کردارەکان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">هەموو کردارەکان</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn("severity")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(v) =>
            table.getColumn("severity")?.setFilterValue(v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="هەموو ئاستەکان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">هەموو ئاستەکان</SelectItem>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            (table.getColumn("entityType")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(v) =>
            table.getColumn("entityType")?.setFilterValue(v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="هەموو جۆرەکان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">هەموو جۆرەکان</SelectItem>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setColumnFilters([]);
          }}
        >
          ڕەستکردنەوە
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  هیچ ئەنجامێک نەدۆزرایەوە
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          کۆی {table.getFilteredRowModel().rows.length} تۆمار
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            پێشوو
          </Button>
          <span className="text-sm">
            لاپەڕە {table.getState().pagination.pageIndex + 1} لە{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            دواتر
          </Button>
        </div>
      </div>
    </div>
  );
}
