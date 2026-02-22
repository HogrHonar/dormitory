"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { useState } from "react";
import { getEducationYears } from "@/app/data/(public)/educationYear";

/* ------------------------------------------------------------------ */
/*  Filters shape (mirrors page.tsx)                                    */
/* ------------------------------------------------------------------ */

type Filters = {
  installmentId?: string;
  fullNameKu?: string;
  department?: string;
  entranceYear?: { name?: string };
  paymentStatus?: string;
  paymentType?: "RECEIVE" | "RETURN" | "DISCOUNT";
  studentCode?: string;
};

/* ------------------------------------------------------------------ */
/*  Totals shape                                                        */
/* ------------------------------------------------------------------ */

type Totals = {
  totalInstallmentAmount: number;
  totalPaid: number;
  totalDiscount: number;
  totalRemaining: number;
};

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  /* server-side pagination */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /* server-side filtering */
  onFilter: (filters: Filters) => void;
  /* optional totals footer */
  totals?: Totals;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const PAYMENT_STATUS_OPTIONS = [
  { value: "ALL", label: "هەموو" },
  { value: "PAID", label: "پارەدراو" },
  { value: "NOT_PAID", label: "پارەنەدراو" },
  { value: "PARTIALLY_PAID", label: "بەشێکی پارەدراو" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "ALL", label: "هەموو" },
  { value: "RECEIVE", label: "وەرگرتن" },
  { value: "RETURN", label: "گەڕانەوە" },
  { value: "DISCOUNT", label: "داشکاندن" },
];

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onFilter,
  totals,
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

  const [entranceYears, setEntranceYears] = useState<
    { id: string; name: string }[]
  >([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  /* ---------- local filter state (controlled inputs) ---------- */
  const [localFilters, setLocalFilters] = React.useState<Filters>({});

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  React.useEffect(() => {
    const fetchEntranceYears = async () => {
      const res = await getEducationYears();
      setEntranceYears(res);
    };
    fetchEntranceYears();
  }, []);

  const totalPages = Math.ceil(total / pageSize);

  /* ---------- helpers ---------- */
  function updateLocalFilter<K extends keyof Filters>(
    key: K,
    value: Filters[K],
  ) {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    // strip out "ALL" sentinel values before sending to parent
    const cleaned: Filters = { ...localFilters };
    if ((cleaned.paymentStatus as string) === "ALL")
      delete cleaned.paymentStatus;
    if ((cleaned.paymentType as string) === "ALL") delete cleaned.paymentType;
    onFilter(cleaned);
  }

  function resetFilters() {
    setLocalFilters({});
    onFilter({});
  }

  function formatAmount(n?: number) {
    if (n === undefined) return "—";
    return n.toLocaleString("ku");
  }

  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* -------- FILTER BAR -------- */}
      <div className="grid grid-cols-2 gap-3 rounded-md border p-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Student name */}
        <Input
          dir="rtl"
          placeholder="ناوی فێرخواز..."
          value={localFilters.fullNameKu ?? ""}
          onChange={(e) =>
            updateLocalFilter("fullNameKu", e.target.value || undefined)
          }
        />

        {/* Student code */}
        <Input
          dir="rtl"
          placeholder="کۆدی فێرخواز..."
          value={localFilters.studentCode ?? ""}
          onChange={(e) =>
            updateLocalFilter("studentCode", e.target.value || undefined)
          }
        />

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
            value={localFilters.department ?? "all"}
            onValueChange={(value) =>
              updateLocalFilter(
                "department",
                value === "all" ? undefined : value,
              )
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

        {/* Entrance year */}
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
            value={localFilters.entranceYear?.name}
            onValueChange={(value) =>
              updateLocalFilter(
                "entranceYear",
                value === "all" ? undefined : { name: value },
              )
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

        {/* Payment status */}
        <div className="flex flex-col w-full">
          <Label
            htmlFor="gender"
            dir="rtl"
            className="mb-2 text-xs font-medium text-muted-foreground"
          >
            دۆخی پارەدان
          </Label>
        <Select
          value={(localFilters.paymentStatus as string) ?? "ALL"}
          onValueChange={(v) =>
            updateLocalFilter("paymentStatus", v === "ALL" ? undefined : v)
          }
          dir="rtl"
        >
          <SelectTrigger>
            <SelectValue placeholder="دۆخی پارەدان" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>

        {/* Payment type */}
        <div className="flex flex-col w-full">
          <Label
            htmlFor="gender"
            dir="rtl"
            className="mb-2 text-xs font-medium text-muted-foreground"
          >
            جۆری پارەدان
          </Label>
        <Select
          value={(localFilters.paymentType as string) ?? "ALL"}
          onValueChange={(v) =>
            updateLocalFilter(
              "paymentType",
              v === "ALL" ? undefined : (v as Filters["paymentType"]),
            )
          }
          dir="rtl"
        >
          <SelectTrigger>
            <SelectValue placeholder="جۆری پارەدان" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 col-span-2 md:col-span-1">
          <Button className="flex-1" onClick={applyFilters}>
            گەڕان
          </Button>
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            سڕینەوە
          </Button>
        </div>
      </div>

      {/* -------- TABLE -------- */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-right">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                  چاوەڕێ بکە...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-right">
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

          {/* -------- TOTALS FOOTER -------- */}
          {totals && (
            <TableFooter>
              <TableRow className="font-bold bg-muted/50">
                {/* span over id + studentCode + name + department + installment cols = 5 */}
                <TableCell colSpan={5} className="text-right">
                  کۆی گشتی
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(totals.totalInstallmentAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(totals.totalPaid)}
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(totals.totalDiscount)}
                </TableCell>
                {/* returned — no server total yet, leave blank */}
                <TableCell />
                <TableCell className="text-right">
                  {formatAmount(totals.totalRemaining)}
                </TableCell>
                {/* status + lastPaidAt */}
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {/* -------- PAGINATION -------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">ژمارەی ڕیز:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            dir="rtl"
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <span className="text-sm text-muted-foreground">
          لاپەڕەی {page} لە {totalPages} — کۆی {total} ئەنجام
        </span>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            پێشوو
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            دواتر
          </Button>
        </div>
      </div>
    </div>
  );
}
