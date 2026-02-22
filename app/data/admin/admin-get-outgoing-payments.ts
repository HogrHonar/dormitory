import { prisma } from "@/lib/prisma";

export async function adminGetOutgoingPayments() {
  return await prisma.outgoingPayment.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function adminGetAvailableBalance() {
  const [
    totalReceived,
    totalReturned,
    totalDiscounted,
    totalHandedOver,
    totalExpenses,
    totalInsurancePaid,
    totalInsuranceReturned,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { paymentType: "RECEIVE" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paymentType: "RETURN" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paymentType: "DISCOUNT" },
      _sum: { amount: true },
    }),
    prisma.outgoingPayment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amountToHandOver: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
    prisma.dormInsurance.aggregate({
      _sum: { amountPaid: true },
    }),
    prisma.dormInsurance.aggregate({
      where: { status: "RETURNED" },
      _sum: { amountReturned: true },
    }),
  ]);

  const received = totalReceived._sum.amount ?? 0;
  const returned = totalReturned._sum.amount ?? 0;
  const discounted = totalDiscounted._sum.amount ?? 0;
  const handedOver = totalHandedOver._sum.amountToHandOver ?? 0;
  const expenses = totalExpenses._sum.amount ?? 0;
  const insurancePaid = totalInsurancePaid._sum.amountPaid ?? 0;
  const insuranceRet = totalInsuranceReturned._sum.amountReturned ?? 0;

  // Income:   student payments received + insurance deposits collected
  // Outgoing: payment returns + discounts + approved hand-overs + expenses + insurance refunded to students
  const availableBalance =
    received +
    insurancePaid -
    returned -
    discounted -
    handedOver -
    expenses -
    insuranceRet;

  return availableBalance;
}
