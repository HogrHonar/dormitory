// app/data/admin/admin-get-student-payments.ts
import { prisma } from "@/lib/prisma";

export async function adminGetStudentPayments(studentId: string) {
  return prisma.payment.findMany({
    where: { studentId },
    orderBy: {
      paidAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      paymentType: true,
      paymentMethod: true,
      paidAt: true,
      installment: {
        select: {
          title: true,
          installmentNo: true,
        },
      },
    },
  });
}

export type StudentPayment = Awaited<
  ReturnType<typeof adminGetStudentPayments>
>[number];
