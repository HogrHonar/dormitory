import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export type reportProps = {
  id: string;
  studentCode: string;
  fullNameEn: string;
  fullNameKu: string;
  department: {
    name: string;
  };
  entranceYear: {
    name: string;
  };
};

type Filters = {
  installmentId?: string;
  fullNameKu?: string;
  department?: string;
  entranceYear?: {
    name?: string;
  };
  paymentStatus?: string;
  paymentType?: "RECEIVE" | "RETURN" | "DISCOUNT";
  studentCode?: string;
};
export type PaymentRow = {
  // synthetic id for the table key
  id: string;
  student: {
    id: string;
    studentCode: string;
    fullNameKu: string;
    fullNameEn: string;
    department: { name: string };
  };
  installment: {
    id: string;
    title: string;
    installmentNo: number;
    amount: number;
  };
  paid: number;
  discount: number;
  returned: number;
  remaining: number;
  paymentStatus: string | null;
  lastPaidAt: Date | string | null;
};

export type PaymentsResult = {
  data: PaymentRow[];
  total: number;
  totals: {
    totalInstallmentAmount: number;
    totalPaid: number;
    totalDiscount: number;
    totalRemaining: number;
  };
};
export async function adminGetPaymentsReport(
  filters: Filters,
  page: number,
  pageSize: number,
): Promise<PaymentsResult> {
  const skip = (page - 1) * pageSize;

  const studentWhere: Prisma.StudentWhereInput = {};
  if (filters.department) {
    studentWhere.department = { name: filters.department };
  }
  if (filters.fullNameKu) {
    studentWhere.fullNameKu = {
      contains: filters.fullNameKu,
      mode: "insensitive",
    };
  }
  if (filters.studentCode) {
    studentWhere.studentCode = {
      contains: filters.studentCode,
      mode: "insensitive",
    };
  }
  if (filters.entranceYear?.name) {
    studentWhere.entranceYear = { name: filters.entranceYear.name };
  }

  const installmentWhere: Prisma.InstallmentWhereInput = {};
  if (filters.installmentId) {
    installmentWhere.id = filters.installmentId;
  }
  const [allStudents, allInstallments] = await Promise.all([
    prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        studentCode: true,
        fullNameKu: true,
        fullNameEn: true,
        department: { select: { name: true } },
      },
    }),
    prisma.installment.findMany({
      where: installmentWhere,
      select: { id: true, title: true, installmentNo: true, amount: true },
      orderBy: { installmentNo: "asc" },
    }),
  ]);

  const studentIds = allStudents.map((s) => s.id);
  const installmentIds = allInstallments.map((i) => i.id);

  /* ---------- FETCH ALL RELEVANT PAYMENTS ---------- */

  const allPayments = await prisma.payment.findMany({
    where: {
      studentId: { in: studentIds },
      installmentId: { in: installmentIds },
    },
    select: {
      studentId: true,
      installmentId: true,
      paymentType: true,
      amount: true,
      discountAmount: true,
      paymentStatus: true,
      paidAt: true,
    },
    orderBy: { paidAt: "desc" },
  });

  /* ---------- AGGREGATE PER STUDENT × INSTALLMENT ---------- */

  type PairAgg = {
    paid: number;
    discount: number;
    returned: number;
    paymentStatus: string | null;
    lastPaidAt: Date | null;
  };

  const pairMap = new Map<string, PairAgg>();

  // Pre-seed every pair at zero so unpaid students appear
  for (const s of allStudents) {
    for (const inst of allInstallments) {
      pairMap.set(`${s.id}::${inst.id}`, {
        paid: 0,
        discount: 0,
        returned: 0,
        paymentStatus: null,
        lastPaidAt: null,
      });
    }
  }

  // Fill from actual payment rows
  for (const p of allPayments) {
    const key = `${p.studentId}::${p.installmentId}`;
    const agg = pairMap.get(key);
    if (!agg) continue;

    if (p.paymentType === "RECEIVE") {
      agg.paid += p.amount;
    } else if (p.paymentType === "DISCOUNT") {
      agg.discount += p.discountAmount ?? p.amount;
    } else if (p.paymentType === "RETURN") {
      agg.returned += p.amount;
    }

    // Keep the most recent paymentStatus and paidAt
    if (!agg.lastPaidAt || p.paidAt > agg.lastPaidAt) {
      agg.lastPaidAt = p.paidAt;
      agg.paymentStatus = p.paymentStatus;
    }
  }

  /* ---------- BUILD ALL ROWS ---------- */

  type FullRow = PaymentRow & { _remaining: number };

  const allRows: FullRow[] = [];

  for (const s of allStudents) {
    for (const inst of allInstallments) {
      const key = `${s.id}::${inst.id}`;
      const agg = pairMap.get(key)!;
      const remaining = Math.max(inst.amount - agg.paid - agg.discount, 0);

      // Derive paymentStatus from aggregated amounts — this is the source of truth
      let derivedStatus: string;
      if (agg.paid === 0 && agg.discount === 0) {
        derivedStatus = "NOT_PAID";
      } else if (remaining === 0) {
        derivedStatus = "PAID";
      } else {
        derivedStatus = "PARTIALLY_PAID";
      }

      allRows.push({
        id: key,
        student: {
          id: s.id,
          studentCode: s.studentCode,
          fullNameKu: s.fullNameKu,
          fullNameEn: s.fullNameEn,
          department: { name: s.department.name },
        },
        installment: {
          id: inst.id,
          title: inst.title,
          installmentNo: inst.installmentNo,
          amount: inst.amount,
        },
        paid: agg.paid,
        discount: agg.discount,
        returned: agg.returned,
        remaining,
        paymentStatus: derivedStatus,
        lastPaidAt: agg.lastPaidAt,
        _remaining: remaining,
      });
    }
  }

  /* ---------- APPLY paymentStatus FILTER ---------- */
  // Must happen AFTER derivedStatus is computed for every row.
  const filteredRows = filters.paymentStatus
    ? allRows.filter((row) => row.paymentStatus === filters.paymentStatus)
    : allRows;

  /* ---------- TOTALS (from full filtered set, before pagination) ---------- */

  let totalInstallmentAmount = 0;
  let totalPaid = 0;
  let totalDiscount = 0;
  let totalRemaining = 0;

  for (const row of filteredRows) {
    totalInstallmentAmount += row.installment.amount;
    totalPaid += row.paid;
    totalDiscount += row.discount;
    totalRemaining += row.remaining;
  }

  /* ---------- PAGINATE ---------- */

  const total = filteredRows.length;
  const data = filteredRows.slice(skip, skip + pageSize);

  return {
    data,
    total,
    totals: {
      totalInstallmentAmount,
      totalPaid,
      totalDiscount,
      totalRemaining,
    },
  };
}
