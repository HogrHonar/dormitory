"use server";

import {
  adminGetPaymentsReport,
  PaymentsResult,
} from "@/app/data/admin/reports/admin-get-paymentreport";

type Filters = {
  installmentId?: string;
  fullNameKu?: string;
  department?: string;
  entranceYear?: { name?: string };
  paymentStatus?: string;
  paymentType?: "RECEIVE" | "RETURN" | "DISCOUNT";
  studentCode?: string;
};

export async function fetchPaymentsReport(
  filters: Filters,
  page: number,
  pageSize: number,
): Promise<PaymentsResult> {
  return adminGetPaymentsReport(filters, page, pageSize);
}
