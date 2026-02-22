"use client";

import { useMemo } from "react";

import {
  SortingState,
  ColumnDef,
  flexRender,
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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

import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import { DataTablePagination } from "./DataTablePagination";
import React from "react";
import { useRouter } from "next/navigation";
import { StudentRow } from "@/lib/zodSchemas";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onFilter: (filters: Filters, page: number, pageSize: number) => void;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void; // Changed from setPage
  pageSize: number;
  total: number;
  onPageSizeChange: (pageSize: number) => void; // Changed from setPageSize
}

type Filters = {
  fullNameKu?: string;
  mobileNo?: string;
  department?: string;
  floorNo?: string;
  roomNo?: string;
  entranceYear?: { name: string };
};

export function DataTable<TData, TValue>({
  columns,
  data,
  onFilter,
  loading,
  page,
  onPageChange,
  pageSize,
  total,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const departmentEnum = [
    "Pharmacy",
    "Nursing",
    "Business Administration",
    "IT",
    "Interior Decoration",
    "Motion Graphics",
    "Automotive Mechanics",
    "Forensic Evidence",
    "Medical Laboratory Technology",
    "Ophthalmic Service and Technology",
    "English for Career Development",
    "Legal Administration",
  ];
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<Filters>({});
  const router = useRouter();

  const [entranceYears, setEntranceYears] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    const fetchEntranceYears = async () => {
      const res = await getEducationYears();
      setEntranceYears(res);
    };
    fetchEntranceYears();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },

    onPaginationChange: (updater) => {
      const currentState = { pageIndex: page - 1, pageSize };
      const nextState =
        typeof updater === "function" ? updater(currentState) : updater;

      // Only call handlers if values actually changed
      if (nextState.pageIndex !== currentState.pageIndex) {
        onPageChange(nextState.pageIndex + 1);
      }
      if (nextState.pageSize !== currentState.pageSize) {
        onPageSizeChange(nextState.pageSize);
      }
    },
  });

  function normalizeFilters(filters: Filters): Filters {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => {
        if (!value) return false;
        if (value === "all") return false;
        if (typeof value === "object" && value.name === "all") return false;
        return true;
      }),
    );
  }

  const applyFilters = () => {
    const cleaned = normalizeFilters(filters);
    onFilter(cleaned, 1, pageSize); // This will trigger handleFilter in the parent
  };

  const debouncedSetFilters = useMemo(
    () =>
      debounce((newFilters: Filters) => {
        setFilters(newFilters);
      }, 500), // Wait 500ms after user stops typing
    [],
  );

  function debounce<T extends (...args: never[]) => unknown>(
    func: T,
    wait: number,
  ) {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center py-4">
        <div className="p-4 w-full">
          <Card className="shadow-accent">
            <CardContent>
              <div className="flex  items-center gap-4 py-4 ">
                {/* Full Name */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="fullNameKu"
                    dir="rtl"
                    className="mb-2 text-xs font-medium text-muted-foreground"
                  >
                    گەڕان بەپێی ناو
                  </Label>
                  <Input
                    placeholder="گەڕان بەپێی ناو"
                    value={filters.fullNameKu}
                    onChange={(e) => {
                      const value = e.target.value;
                      debouncedSetFilters({ ...filters, fullNameKu: value });
                    }}
                    className="w-48"
                    id="fullNameKu"
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col">
                  <Label
                    htmlFor="mobileNo"
                    dir="rtl"
                    className="mb-2 text-xs font-medium text-muted-foreground"
                  >
                    گەڕان بەپێی ژمارەی مۆبایل
                  </Label>
                  <Input
                    id="mobileNo"
                    placeholder="گەڕان بەپێی ژمارەی مۆبایل"
                    value={filters.mobileNo}
                    onChange={(e) => {
                      const value = e.target.value;
                      debouncedSetFilters({ ...filters, mobileNo: value });
                    }}
                    className="w-48"
                    pattern="^[0-9]*$"
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="gender"
                    dir="rtl"
                    className="mb-2 text-xs font-medium text-muted-foreground"
                  >
                    ساڵی خوێندن
                  </Label>
                  <Select
                    dir="rtl"
                    value={filters.entranceYear?.name}
                    onValueChange={(value) =>
                      setFilters({ ...filters, entranceYear: { name: value } })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="ساڵی خوێندن" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" dir="rtl">
                        هەموو
                      </SelectItem>
                      {entranceYears.map((year) => (
                        <SelectItem key={year.id} value={year.name} dir="rtl">
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department */}
                <div className="flex flex-col w-full">
                  <Label
                    htmlFor="department"
                    dir="rtl"
                    className="mb-2 text-xs font-medium text-muted-foreground"
                  >
                    بەش
                  </Label>
                  <Select
                    value={filters.department ?? "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, department: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="بەش" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" dir="rtl">
                        هەموو
                      </SelectItem>
                      {departmentEnum.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor */}
                <div className="flex gap-4">
                  <div className="flex flex-col w-full">
                    <Label
                      htmlFor="floorNo"
                      dir="rtl"
                      className="mb-2 text-xs font-medium text-muted-foreground"
                    >
                      نهۆم
                    </Label>
                    <Select
                      dir="rtl"
                      value={filters.floorNo ?? "all"}
                      onValueChange={(value) =>
                        setFilters({ ...filters, floorNo: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="نهۆم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" dir="rtl">
                          هەموو
                        </SelectItem>
                        {Array.from({ length: 4 }, (_, i) => i + 1).map(
                          (floorNo) => (
                            <SelectItem
                              key={floorNo}
                              value={floorNo.toString()}
                            >
                              {floorNo}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col w-full">
                    <Label
                      htmlFor="roomNo"
                      dir="rtl"
                      className="mb-2 text-xs font-medium text-muted-foreground"
                    >
                      ژوور
                    </Label>
                    <Select
                      dir="rtl"
                      value={filters.roomNo ?? "all"}
                      onValueChange={(value) =>
                        setFilters({ ...filters, roomNo: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ژوور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" dir="rtl">
                          هەموو
                        </SelectItem>
                        {Array.from({ length: 4 }, (_, i) => i + 1).map(
                          (roomNo) => (
                            <SelectItem key={roomNo} value={roomNo.toString()}>
                              {roomNo}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Room */}
              </div>

              <Button
                onClick={applyFilters}
                disabled={!filters}
                variant="outline"
              >
                پاڵاوتن
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="text-xl font-bold mb-4">لیستی فێرخوازان</p>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    router.push(
                      `/admin/students/${(row.original as StudentRow).id}/payments`,
                    )
                  }
                  className="cursor-pointer hover:bg-muted/50" // optional styling
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} total={total} />
    </div>
  );
}
