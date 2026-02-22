"use client";

import { useState } from "react";

export interface PaymentReportFilters {
  department?: string; // Department ID
  year?: string; // EducationalYear ID (current academic year)
  entranceyear?: string; // EducationalYear ID (entrance year)
  installments?: string; // Installment ID (single installment) or undefined for all
  paidstatus?: "paid" | "partial" | "unpaid" | "all";
}

export function usePaymentReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadReport(filters: PaymentReportFilters = {}) {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.department) params.set("department", filters.department);
      if (filters.year) params.set("year", filters.year);
      if (filters.entranceyear)
        params.set("entranceyear", filters.entranceyear);
      if (filters.installments)
        params.set("installments", filters.installments);
      if (filters.paidstatus && filters.paidstatus !== "all")
        params.set("paidstatus", filters.paidstatus);

      const res = await fetch(`/api/reports/payments?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(error || `HTTP ${res.status}`);
      }

      // Stream the PDF blob and trigger a download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate report";
      setError(message);
      console.error("[usePaymentReport]", err);
    } finally {
      setLoading(false);
    }
  }

  return { downloadReport, loading, error };
}
