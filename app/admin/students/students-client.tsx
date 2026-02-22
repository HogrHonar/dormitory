"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  adminGetStudents,
  StudentsProps,
} from "@/app/data/admin/admin-get-students";
import { authClient } from "@/lib/auth-client";

/* ---------------- TYPES ---------------- */

type Filters = {
  fullNameKu?: string;
  mobileNo?: string;
  department?: string;
  floorNo?: string;
  roomNo?: string;
  entranceYear?: { name: string };
};
interface StudentsClientProps {
  canCreate: boolean;
}
/* ---------------- HELPERS ---------------- */

function parseFiltersFromURL(searchParams: URLSearchParams): Filters {
  return {
    fullNameKu: searchParams.get("fullNameKu") || undefined,
    mobileNo: searchParams.get("mobileNo") || undefined,
    department: searchParams.get("department") || undefined,
    floorNo: searchParams.get("floorNo") || undefined,
    roomNo: searchParams.get("roomNo") || undefined,
    entranceYear: searchParams.get("entranceYear")
      ? { name: searchParams.get("entranceYear")! }
      : undefined,
  };
}

/* ---------------- PAGE ---------------- */

export default function StudentsClient({ canCreate }: StudentsClientProps) {
  const { data: session } = authClient.useSession();

  const router = useRouter();
  const searchParams = useSearchParams();

  const memoizedColumns = useMemo(() => columns, []);

  /* ---------- STATE ---------- */

  const [data, setData] = useState<StudentsProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    () => Number(searchParams.get("pageSize")) || 10,
  );
  const [filters, setFilters] = useState<Filters>(() =>
    parseFiltersFromURL(searchParams),
  );

  const [isInitialized, setIsInitialized] = useState(false);

  /* ---------- INITIALIZE FROM URL (once) ---------- */

  useEffect(() => {
    if (!isInitialized) {
      setPage(Number(searchParams.get("page")) || 1);
      setPageSize(Number(searchParams.get("pageSize")) || 10);
      setFilters(parseFiltersFromURL(searchParams));
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- STATE → FETCH ---------- */

  useEffect(() => {
    if (!isInitialized) return; // Don't fetch until initialized

    async function fetchData() {
      setLoading(true);
      try {
        const res = await adminGetStudents(
          filters,
          page,
          pageSize,
          session?.user?.id ?? "",
        );
        setData(res.data ?? []);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters, page, pageSize, isInitialized]);

  /* ---------- STATE → URL (for bookmarking) ---------- */

  useEffect(() => {
    if (!isInitialized) return; // Don't update URL until initialized

    const params = new URLSearchParams();

    if (filters.fullNameKu) params.set("fullNameKu", filters.fullNameKu);
    if (filters.mobileNo) params.set("mobileNo", filters.mobileNo);
    if (filters.department) params.set("department", filters.department);
    if (filters.floorNo) params.set("floorNo", filters.floorNo);
    if (filters.roomNo) params.set("roomNo", filters.roomNo);
    if (filters.entranceYear?.name)
      params.set("entranceYear", filters.entranceYear.name);

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, page, pageSize, router, isInitialized]);

  /* ---------- HANDLERS ---------- */

  function handleFilter(nextFilters: Filters) {
    setFilters(nextFilters);
    setPage(1); // reset page on filter
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1); // reset to page 1 when changing page size
  }

  /* ---------- RENDER ---------- */

  return (
    <main className="container mx-auto px-4">
      <div className="flex items-center justify-between">
        {canCreate && (
          <Link
            href="/admin/students/create"
            className={buttonVariants({ variant: "default" })}
          >
            زیادکردن <PlusIcon />
          </Link>
        )}

        <p className="text-xl font-bold">لیستی فێرخوازانی بەشە ناوخۆیی</p>
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable
          columns={memoizedColumns}
          data={data}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onFilter={handleFilter}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </main>
  );
}
