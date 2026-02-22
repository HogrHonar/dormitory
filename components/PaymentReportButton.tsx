"use client";

import { useState } from "react";
import {
  usePaymentReport,
  PaymentReportFilters,
} from "@/hooks/usePaymentReport";

// ─── Replace these with your actual data-fetching hooks / selects ────────────
// These props represent lists fetched from your database (e.g. via React Query)
interface Department {
  id: string;
  name: string;
  code: string;
}
interface EducationalYear {
  id: string;
  name: string;
}
interface Installment {
  id: string;
  title: string;
  installmentNo: number;
}

interface PaymentReportButtonProps {
  departments: Department[];
  educationalYears: EducationalYear[];
  installments: Installment[];
}

export function PaymentReportButton({
  departments,
  educationalYears,
  installments,
}: PaymentReportButtonProps) {
  const { downloadReport, loading, error } = usePaymentReport();

  const [filters, setFilters] = useState<PaymentReportFilters>({
    department: undefined,
    year: undefined,
    entranceyear: undefined,
    installments: undefined,
    paidstatus: "all",
  });

  const set =
    (key: keyof PaymentReportFilters) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setFilters((prev) => ({ ...prev, [key]: e.target.value || undefined }));

  const handleDownload = () => downloadReport(filters);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-950 text-white text-lg">
          📊
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Payment Report
          </h3>
          <p className="text-xs text-gray-500">
            Export filtered student payments as PDF
          </p>
        </div>
      </div>

      {/* ── Filter grid ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Department */}
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600">Department</span>
          <select
            value={filters.department ?? ""}
            onChange={set("department")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                [{d.code}] {d.name}
              </option>
            ))}
          </select>
        </label>

        {/* Educational Year */}
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600">
            Academic Year
          </span>
          <select
            value={filters.year ?? ""}
            onChange={set("year")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Years</option>
            {educationalYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </label>

        {/* Entrance Year */}
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600">
            Entrance Year
          </span>
          <select
            value={filters.entranceyear ?? ""}
            onChange={set("entranceyear")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Entrance Years</option>
            {educationalYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </label>

        {/* Installment */}
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600">Installment</span>
          <select
            value={filters.installments ?? ""}
            onChange={set("installments")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Installments</option>
            {installments.map((i) => (
              <option key={i.id} value={i.id}>
                #{i.installmentNo} — {i.title}
              </option>
            ))}
          </select>
        </label>

        {/* Paid Status */}
        <label className="space-y-1">
          <span className="text-xs font-medium text-gray-600">
            Payment Status
          </span>
          <select
            value={filters.paidstatus ?? "all"}
            onChange={set("paidstatus")}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </label>
      </div>

      {/* ── Error message ── */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* ── Download button ── */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Generating PDF…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V3a1 1 0 011-1z" />
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
            Download PDF Report
          </>
        )}
      </button>
    </div>
  );
}
