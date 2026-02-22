// app/data/admin/admin-get-student-details.ts
import { prisma } from "@/lib/prisma";

export async function adminGetStudentDetails(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      studentCode: true,
      fullNameEn: true,
      fullNameKu: true,
      mobileNo: true,
      email: true,
      gender: true,
      entranceYear: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      room: {
        select: {
          id: true,
          roomNumber: true,
          floorNumber: true,
        },
      },
      payments: {
        select: {
          amount: true,
          paymentType: true,
          installmentId: true,
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  // Get installments for this student's entrance year
  const installments = await prisma.installment.findMany({
    where: {
      entranceYearId: student.entranceYear.id,
    },
    orderBy: {
      installmentNo: "asc",
    },
    select: {
      id: true,
      title: true,
      amount: true,
      installmentNo: true,
      startDate: true,
      endDate: true,
    },
  });

  // Total amount is the sum of all installments
  const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);

  // Calculate payment status for each installment
  const installmentStatus = installments.map((installment) => {
    const installmentPayments = student.payments.filter(
      (p) => p.installmentId === installment.id,
    );

    const paidAmount = installmentPayments.reduce((sum, payment) => {
      if (payment.paymentType === "RECEIVE") {
        return sum + payment.amount;
      } else if (payment.paymentType === "RETURN") {
        return sum - payment.amount;
      } else if (payment.paymentType === "DISCOUNT") {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    const remainingAmount = installment.amount - paidAmount;

    return {
      installmentId: installment.id,
      installmentNo: installment.installmentNo,
      title: installment.title,
      amount: installment.amount,
      paidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      status:
        paidAmount >= installment.amount
          ? ("paid" as const)
          : paidAmount > 0
            ? ("partial" as const)
            : ("unpaid" as const),
      startDate: installment.startDate,
      endDate: installment.endDate,
    };
  });

  // Calculate totals
  const totalPaid = installmentStatus.reduce(
    (sum, inst) => sum + inst.paidAmount,
    0,
  );
  const balance = totalAmount - totalPaid;

  // Count installments by status
  const paidCount = installmentStatus.filter((i) => i.status === "paid").length;
  const partialCount = installmentStatus.filter(
    (i) => i.status === "partial",
  ).length;
  const unpaidCount = installmentStatus.filter(
    (i) => i.status === "unpaid",
  ).length;

  return {
    id: student.id,
    studentCode: student.studentCode,
    fullNameEn: student.fullNameEn,
    fullNameKu: student.fullNameKu,
    mobileNo: student.mobileNo,
    email: student.email,
    entranceYear: student.entranceYear.name, // Return the name as string
    department: student.department,
    totalAmount,
    totalPaid,
    balance,
    installmentStatus,
    installmentCounts: {
      total: installments.length,
      paid: paidCount,
      partial: partialCount,
      unpaid: unpaidCount,
    },
  };
}

export type StudentDetails = NonNullable<
  Awaited<ReturnType<typeof adminGetStudentDetails>>
>;
