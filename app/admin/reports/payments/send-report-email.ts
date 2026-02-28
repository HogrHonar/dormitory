"use server";

import { Resend } from "resend";
import { adminGetPaymentsReport } from "@/app/data/admin/reports/admin-get-paymentreport";
import { renderPaymentsReport } from "./report-pdf";

const resend = new Resend(process.env.RESEND_API_KEY);

type Filters = {
  installmentId?: string;
  fullNameKu?: string;
  department?: string;
  entranceYear?: { name?: string };
  paymentStatus?: string;
  paymentType?: "RECEIVE" | "RETURN" | "DISCOUNT";
  studentCode?: string;
};

type Totals = {
  totalInstallmentAmount: number;
  totalPaid: number;
  totalDiscount: number;
  totalRemaining: number;
};

/* ------------------------------------------------------------------ */
/*  Build a human-readable label from the active filters               */
/* ------------------------------------------------------------------ */

function buildFilterLabel(filters: Filters): string {
  const parts: string[] = [];
  if (filters.fullNameKu) parts.push(`Name: ${filters.fullNameKu}`);
  if (filters.studentCode) parts.push(`Code: ${filters.studentCode}`);
  if (filters.department) parts.push(`Dept: ${filters.department}`);
  if (filters.entranceYear?.name)
    parts.push(`Year: ${filters.entranceYear.name}`);
  if (filters.paymentStatus)
    parts.push(`Status: ${filters.paymentStatus.replace("_", " ")}`);
  if (filters.paymentType) parts.push(`Type: ${filters.paymentType}`);
  return parts.length ? `Filters — ${parts.join(" | ")}` : "All records";
}

/* ------------------------------------------------------------------ */
/*  Server Action                                                       */
/* ------------------------------------------------------------------ */

export async function sendPaymentsReportEmail(
  filters: Filters,
  totals: Totals,
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmail = "Dormitory <noreply@mail.btvi.edu.iq>";
    if (!adminEmail) {
      throw new Error("REPORT_ADMIN_EMAIL is not set in environment variables");
    }

    /* ---------- Fetch ALL filtered rows (no pagination) ---------- */
    // We pass a very large pageSize so every matching row is included.
    const result = await adminGetPaymentsReport(filters, 1, 999_999);
    const rows = result.data;

    if (rows.length === 0) {
      return {
        success: false,
        error: "No data to send — the filtered result is empty.",
      };
    }

    /* ---------- Generate PDF buffer ---------- */
    const filterLabel = buildFilterLabel(filters);

    const pdfBuffer = await renderPaymentsReport({
      rows,
      totals,
      filterLabel,
    });

    /* ---------- Send via Resend ---------- */
    const date = new Date().toLocaleDateString("en-GB");

    const { error } = await resend.emails.send({
      from: "Dormitory <noreply@mail.btvi.edu.iq>",
      to: ["all.hods@btvi.edu.iq"],
      subject: `Payments Report — ${date}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Payments Report</h2>
          <p>Please find the payments report attached.</p>
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            <tr style="background:#f0f4f8;">
              <td style="padding:8px; font-weight:bold;">Records</td>
              <td style="padding:8px;">${rows.length}</td>
            </tr>
            <tr>
              <td style="padding:8px; font-weight:bold;">Total Amount</td>
              <td style="padding:8px;">${totals.totalInstallmentAmount.toLocaleString()}</td>
            </tr>
            <tr style="background:#f0f4f8;">
              <td style="padding:8px; font-weight:bold;">Total Paid</td>
              <td style="padding:8px;">${totals.totalPaid.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px; font-weight:bold;">Total Discount</td>
              <td style="padding:8px;">${totals.totalDiscount.toLocaleString()}</td>
            </tr>
            <tr style="background:#f0f4f8;">
              <td style="padding:8px; font-weight:bold;">Total Remaining</td>
              <td style="padding:8px;">${totals.totalRemaining.toLocaleString()}</td>
            </tr>
          </table>
          <p style="color:#6b7280; font-size:12px; margin-top:24px;">
            ${filterLabel}<br/>
            Generated: ${new Date().toLocaleString("en-GB")}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `payments-report-${date.replace(/\//g, "-")}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[sendPaymentsReportEmail]", message);
    return { success: false, error: message };
  }
}
