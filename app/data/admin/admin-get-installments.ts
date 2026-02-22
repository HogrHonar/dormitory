"use server";

import { prisma } from "@/lib/prisma";

export async function adminGetInstallments() {
  const installments = await prisma.installment.findMany({
    orderBy: { installmentNo: "asc" },
    select: {
      id: true,
      title: true,
      amount: true,
      installmentNo: true,
      startDate: true,
      endDate: true,
      entranceYear: {
        select: {
          name: true,
        },
      },
      year: {
        select: {
          name: true,
        },
      },
    },
  });

  return installments;
}

export interface InstallmentOption {
  id: string;
  title: string;
  installmentNo: number;
  amount: number;
}

export async function adminGetDetailsofInstammllmentBasePayment(): Promise<
  InstallmentOption[]
> {
  const installments = await prisma.installment.findMany({
    orderBy: { installmentNo: "asc" },
    select: {
      id: true,
      title: true,
      installmentNo: true,
      amount: true,
    },
  });

  return installments;
}
