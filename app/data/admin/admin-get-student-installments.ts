// app/data/admin/get-student-installments.ts
import { prisma } from "@/lib/prisma";

export async function adminGetStudentInstallments(studentId: string) {
  const installments = await prisma.installment.findMany({
    orderBy: { installmentNo: "asc" },
    select: {
      id: true,
      title: true,
      installmentNo: true,
      amount: true, // total installment fee (IQD)
      payments: {
        where: { studentId },
        select: { amount: true, paymentType: true },
      },
    },
  });

  console.log(installments);

  return installments.map((inst) => {
    const paid = inst.payments.reduce((sum, p) => {
      if (p.paymentType === "RECEIVE" || p.paymentType === "DISCOUNT")
        return sum + p.amount;
      if (p.paymentType === "RETURN") return sum - p.amount;
      return sum;
    }, 0);

    const remaining = Math.max(inst.amount - paid, 0);
    const isFullyPaid = remaining <= 0.0001;

    return {
      id: inst.id,
      title: inst.title,
      installmentNo: inst.installmentNo,
      amount: inst.amount,
      paid,
      remaining,
      isFullyPaid,
    };
  });
}
