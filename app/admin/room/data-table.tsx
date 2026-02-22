"use client";

import * as React from "react";
import {
  SortingState,
  ColumnDef,
  flexRender,
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  // Get unique dormitories for filter
  const dormitories = React.useMemo(() => {
    const uniqueDorms = new Map();
    data.forEach((row: any) => {
      if (row.dormitory) {
        uniqueDorms.set(row.dormitory.id, row.dormitory.title);
      }
    });
    return Array.from(uniqueDorms.entries()).map(([id, title]) => ({
      id,
      title,
    }));
  }, [data]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="گەڕان بە ژمارەی ژوور..."
          value={
            (table.getColumn("roomNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("roomNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <Select
          value={
            (table.getColumn("dormitory")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("dormitory")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="هەموو نوێخانەکان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">هەموو نوێخانەکان</SelectItem>
            {dormitories.map((dorm: any) => (
              <SelectItem key={dorm.id} value={dorm.title}>
                {dorm.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          پێشوو
        </Button>
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
  );
}
