"use server-only";

import { prisma } from "@/lib/prisma";

export async function adminGetFees() {
  const fees = await prisma.feeStructure.findMany({
    select: {
      id: true,
      entranceYear: true,
      totalAmount: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!fees) {
    return null;
  }
  return fees;
}
