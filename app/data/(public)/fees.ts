"use server";

import { prisma } from "@/lib/prisma";

export async function getFeeStructures() {
  return prisma.feeStructure.findMany({
    select: {
      id: true,
      entranceYear: true,
      department: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      entranceYear: "asc",
    },
  });
}

export type FeeStructure = Awaited<ReturnType<typeof getFeeStructures>>[0];
