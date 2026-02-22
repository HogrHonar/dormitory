"use server";

import { InstallmentSchemaType } from "@/lib/zodSchemas";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { InstallmentSchema } from "@/lib/zodSchemas";

export async function createInstallmentAction(values: InstallmentSchemaType) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

  const parsed = InstallmentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    yearId,
    entranceYearId,
    title,
    installmentNo,
    amount,
    startDate,
    endDate,
  } = parsed.data;

  const installment = await prisma.installment.createMany({
    data: {
      yearId,
      entranceYearId,
      title,
      installmentNo,
      amount,
      startDate,
      endDate,
    },
  });

  return {
    status: "success",
    message: "Installment created successfully",
    data: installment,
  };
}
