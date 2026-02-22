import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number;
}

export function DataTablePagination<TData>({
  table,
  total,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;

  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const lastPage = Math.ceil(total / pageSize) - 1;

  return (
    <div className="flex items-center justify-between px-2 py-4" dir="rtl">
      <div className="text-muted-foreground flex-1 text-sm">
        پیشاندانی {from}–{to} لە {total} ڕیز
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">ڕیز بۆ هەر پەڕەیەک</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          پەڕە {pageIndex + 1} لە {Math.ceil(total / pageSize)}
        </div>
        <div className="flex items-center gap-2">
          {/* First page - use ChevronsRight for RTL */}
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsRight />
          </Button>
          {/* Previous page - use ChevronRight for RTL */}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronRight />
          </Button>
          {/* Next page - use ChevronLeft for RTL */}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={pageIndex === lastPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronLeft />
          </Button>
          {/* Last page - use ChevronsLeft for RTL */}
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(lastPage)}
            disabled={pageIndex === lastPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsLeft />
          </Button>
        </div>
      </div>
    </div>
  );
}
