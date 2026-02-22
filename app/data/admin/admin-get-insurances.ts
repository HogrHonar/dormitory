import { prisma } from "@/lib/prisma";

export async function adminGetInsurances() {
  const insurances = await prisma.dormInsurance.findMany({
    select: {
      id: true,
      amountPaid: true,
      amountReturned: true,
      returnNote: true,
      returnedAt: true,
      returnedBy: true,
      paymentMethod: true,
      status: true,
      paidAt: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          studentCode: true,
          fullNameKu: true,
          fullNameEn: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!insurances) {
    return [];
  }
  return insurances;
}
