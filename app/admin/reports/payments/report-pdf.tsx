import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { PaymentRow } from "@/app/data/admin/reports/admin-get-paymentreport";

/* ------------------------------------------------------------------ */
/*  Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 8,
    direction: "rtl",
  },
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
  },
  /* Table */
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a5f",
  },
  /* Cells */
  cellHeader: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#4a6fa5",
    textAlign: "center",
  },
  cell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    textAlign: "center",
  },
  cellLast: {
    padding: 5,
    textAlign: "center",
  },
  /* Column widths */
  colNo: { width: "4%" },
  colCode: { width: "9%" },
  colName: { width: "16%" },
  colDept: { width: "12%" },
  colInst: { width: "11%" },
  colAmount: { width: "10%" },
  colPaid: { width: "10%" },
  colDiscount: { width: "9%" },
  colReturned: { width: "9%" },
  colRemaining: { width: "10%" },
  /* Footer row */
  footerRow: {
    flexDirection: "row",
    backgroundColor: "#1e3a5f",
  },
  footerCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#4a6fa5",
    textAlign: "center",
  },
  /* Totals summary box */
  summaryBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f0f4f8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#374151",
  },
  summaryValue: {
    fontSize: 8,
    color: "#111827",
  },
  generatedAt: {
    marginTop: 12,
    fontSize: 7,
    textAlign: "center",
    color: "#9ca3af",
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return n.toLocaleString("en");
}

const STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  NOT_PAID: "Not Paid",
  PARTIALLY_PAID: "Partial",
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

type Totals = {
  totalInstallmentAmount: number;
  totalPaid: number;
  totalDiscount: number;
  totalRemaining: number;
};

type Props = {
  rows: PaymentRow[];
  totals: Totals;
  filterLabel?: string;
};

function PaymentReportPage({ rows, totals, filterLabel }: Props) {
  const generatedAt = new Date().toLocaleString("en-GB");

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Header */}
      <Text style={styles.title}>Payments Report</Text>
      {filterLabel && <Text style={styles.subtitle}>{filterLabel}</Text>}
      <Text style={styles.subtitle}>
        {rows.length} record{rows.length !== 1 ? "s" : ""}
      </Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Column headers */}
        <View style={styles.tableHeader}>
          {(
            [
              ["#", "colNo"],
              ["Code", "colCode"],
              ["Name", "colName"],
              ["Dept", "colDept"],
              ["Installment", "colInst"],
              ["Total", "colAmount"],
              ["Paid", "colPaid"],
              ["Discount", "colDiscount"],
              ["Returned", "colReturned"],
              ["Remaining", "colRemaining"],
            ] as [string, keyof typeof styles][]
          ).map(([label, col], i, arr) => (
            <Text
              key={label}
              style={[
                styles.cellHeader,
                styles[col],
                i === arr.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        {/* Data rows */}
        {rows.map((row, idx) => {
          const isAlt = idx % 2 === 1;
          const rowStyle = isAlt ? styles.tableRowAlt : styles.tableRow;
          return (
            <View key={row.id} style={rowStyle}>
              <Text style={[styles.cell, styles.colNo]}>{idx + 1}</Text>
              <Text style={[styles.cell, styles.colCode]}>
                {row.student.studentCode}
              </Text>
              <Text style={[styles.cell, styles.colName]}>
                {row.student.fullNameEn}
              </Text>
              <Text style={[styles.cell, styles.colDept]}>
                {row.student.department.name}
              </Text>
              <Text style={[styles.cell, styles.colInst]}>
                {row.installment.installmentNo}
              </Text>
              <Text style={[styles.cell, styles.colAmount]}>
                {fmt(row.installment.amount)}
              </Text>
              <Text style={[styles.cell, styles.colPaid]}>{fmt(row.paid)}</Text>
              <Text style={[styles.cell, styles.colDiscount]}>
                {fmt(row.discount)}
              </Text>
              <Text style={[styles.cell, styles.colReturned]}>
                {fmt(row.returned)}
              </Text>
              <Text style={[styles.cellLast, styles.colRemaining]}>
                {fmt(row.remaining)}
              </Text>
            </View>
          );
        })}

        {/* Totals footer row */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerCell, styles.colNo]}></Text>
          <Text style={[styles.footerCell, styles.colCode]}></Text>
          <Text style={[styles.footerCell, styles.colName]}></Text>
          <Text style={[styles.footerCell, styles.colDept]}></Text>
          <Text style={[styles.footerCell, styles.colInst]}>TOTAL</Text>
          <Text style={[styles.footerCell, styles.colAmount]}>
            {fmt(totals.totalInstallmentAmount)}
          </Text>
          <Text style={[styles.footerCell, styles.colPaid]}>
            {fmt(totals.totalPaid)}
          </Text>
          <Text style={[styles.footerCell, styles.colDiscount]}>
            {fmt(totals.totalDiscount)}
          </Text>
          <Text style={[styles.footerCell, styles.colReturned]}></Text>
          <Text
            style={[
              { ...styles.footerCell, borderRightWidth: 0 },
              styles.colRemaining,
            ]}
          >
            {fmt(totals.totalRemaining)}
          </Text>
        </View>
      </View>
      <Text style={styles.generatedAt}>Generated: {generatedAt}</Text>
    </Page>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper — call this from Server Actions to get a typed PDF buffer   */
/* ------------------------------------------------------------------ */
// Add this export alongside your existing PaymentsReportPDF component
export async function renderPaymentsReport(props: Props): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <PaymentReportPage {...props} />
    </Document>,
  );
}
