"use client";

import { useEffect, useMemo, useState } from "react";
import { MailIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { fetchPaymentsReport } from "./action";
import { sendPaymentsReportEmail } from "./send-report-email";
import type {
  PaymentRow,
  PaymentsResult,
} from "@/app/data/admin/reports/admin-get-paymentreport";

/* ---------------- TYPES ---------------- */

type Filters = {
  installmentId?: string;
  fullNameKu?: string;
  department?: string;
  entranceYear?: { name?: string };
  paymentStatus?: string;
  paymentType?: "RECEIVE" | "RETURN" | "DISCOUNT";
  studentCode?: string;
};

/* ---------------- HELPERS ---------------- */

function parseFiltersFromURL(searchParams: URLSearchParams): Filters {
  return {
    fullNameKu: searchParams.get("fullNameKu") || undefined,
    department: searchParams.get("department") || undefined,
    entranceYear: searchParams.get("entranceYear")
      ? { name: searchParams.get("entranceYear")! }
      : undefined,
    paymentStatus: searchParams.get("paymentStatus") || undefined,
    paymentType: searchParams.get("paymentType") as
      | "RECEIVE"
      | "RETURN"
      | "DISCOUNT"
      | undefined,
    studentCode: searchParams.get("studentCode") || undefined,
  };
}

/* ---------------- PAGE ---------------- */

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memoizedColumns = useMemo(() => columns, []);

  /* ---------- STATE ---------- */

  const [data, setData] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState<PaymentsResult["totals"] | undefined>(
    undefined,
  );

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
    if (!isInitialized) return;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetchPaymentsReport(filters, page, pageSize);
        setData(res.data ?? []);
        setTotal(res.total);
        setTotals(res.totals);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters, page, pageSize, isInitialized]);

  /* ---------- STATE → URL (for bookmarking) ---------- */

  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (filters.fullNameKu) params.set("fullNameKu", filters.fullNameKu);
    if (filters.department) params.set("department", filters.department);
    if (filters.entranceYear?.name)
      params.set("entranceYear", filters.entranceYear.name);
    if (filters.paymentStatus)
      params.set("paymentStatus", filters.paymentStatus);
    if (filters.paymentType) params.set("paymentType", filters.paymentType);
    if (filters.studentCode) params.set("studentCode", filters.studentCode);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, page, pageSize, router, isInitialized]);

  /* ---------- HANDLERS ---------- */

  function handleFilter(nextFilters: Filters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  async function handleSendEmail() {
    if (!totals) return;
    setSending(true);
    try {
      const result = await sendPaymentsReportEmail(filters, totals);
      if (result.success) {
        toast.success("ئیمەیڵەکە بە سەرکەوتوویی نێردرا");
      } else {
        toast.error(`هەڵە: ${result.error}`);
      }
    } finally {
      setSending(false);
    }
  }

  /* ---------- RENDER ---------- */

  return (
    <main className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={handleSendEmail}
          disabled={sending || loading || total === 0}
        >
          {sending ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              دەنێردرێت...
            </>
          ) : (
            <>
              ناردن بە ئیمەیڵ <MailIcon className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-xl font-bold">ڕاپۆرتی پارەدانەکان</p>
      </div>

      <div className="container mx-auto" dir="rtl">
        <DataTable
          columns={memoizedColumns}
          data={data}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          totals={totals}
          onFilter={handleFilter}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </main>
  );
}
